#!/usr/bin/env python3
"""Discover design-related skills available to Claude right now.

No skill names are hardcoded: every skill found is tagged from its own name + description,
so a design skill installed tomorrow is picked up by the next run.

Scans, in order (first occurrence of an invoke name wins):
  <project>/.claude/skills/*          project skills
  $CLAUDE_CONFIG_DIR/skills/*         user skills (default ~/.claude/skills)
  skills of every *enabled* plugin    invoked as <plugin>:<skill>
  --extra-root DIR                    any additional skill root (repeatable)

Output buckets:
  design     strong design signal -> candidate specialists
  media      renderers for an output format (PDF, deck, document, graphic, GIF) -> production aids
  adjacent   weak signal (framework / component tooling) -> implementation aids at most
  tools      browser drivers and screenshot tools -> capture for review
  excluded   skills that themselves invoke this skill (seating them would recurse)
Each entry carries capability tags and flags (legacy, needs-image-gen, platform-bound, static-art).

Usage:
  discover_design_skills.py [--project DIR] [--extra-root DIR ...] [--format table|json]
"""
import argparse
import json
import os
import re
import sys
from pathlib import Path

TAGS = {
    "ux": r"\bux\b|usability|user experience|information architecture|user (?:flow|journey)s?",
    "visual": r"visual design|\bvisual\b|aesthetic|premium|composition|palette|look and feel|high-end|slop",
    "typography": r"typograph|font pairing|\bfonts?\b|type scale",
    "brand": r"\bbrand(?:ing| identity| guidelines|kit)?\b|visual identity|\blogos?\b",
    "motion": r"\bmotion\b|animation|\banimate|gsap|scroll ?trigger|micro-interaction",
    "interaction": r"interaction design|micro-interaction|hover states?|interactive states|gesture",
    "design-system": r"design system|design tokens?|design\.md|component librar|theming",
    "responsive": r"responsive|breakpoints?|mobile-first",
    "accessibility": r"accessib|\ba11y\b|wcag|screen reader",
    "frontend": r"frontend|front-end|\bui\b|user interface|web interfaces?|landing pages?|websites?",
    "mobile": r"mobile app|\bios\b|android|swiftui|react native|flutter|app-native",
    "dataviz": r"dashboards?|\bcharts?\b|data vi[sz]",
    "figma": r"\bfigma\b",
    "creative": r"creative coding|generative|shader|webgl|three\.js|visual effects|particle",
    "redesign": r"\bredesign|design audit|audits? (?:the )?(?:current )?(?:design|ui)|critique|moderni[sz]e",
    "polish": r"\bpolish|feel better|optical|pixel-perfect",
}
# Without one of these words a skill is not about design, whatever else it mentions.
ANCHOR = re.compile(r"\bdesign|\bui\b|\bux\b|interface|typograph|aesthetic|\bfigma\b|animation", re.I)
# Design specialists carry at least one of these capability tags.
CORE = {"ux", "visual", "typography", "brand", "motion", "interaction", "design-system",
        "accessibility", "figma", "redesign", "polish", "creative"}
# Skills whose main job is one of these are not design specialists.
NEGATIVE = re.compile(
    r"\bseo\b|slides?\b|pptx|docx|xlsx|spreadsheet|\bpdf\b|e-?mail|\bads?\b|backend|database|"
    r"deploy|test cases|\bsdk\b|durable|runtime|crawl|scrap|browser automation", re.I)
# Capture tools: drive a browser, take screenshots. Site crawlers are not this skill's business.
TOOL = re.compile(r"screenshots?|browser automation|automates? .{0,20}browser|playwright|headless", re.I)
NOT_TOOL = re.compile(r"crawl|backlink|protected .{0,20}deployment", re.I)
# Output-format renderers: skills that produce a file in a medium the design may target.
MEDIA = re.compile(r"\bpdfs?\b|\.pdf|docx|word doc|pptx|slides?\b|presentation|\bdecks?\b|xlsx|"
                   r"spreadsheet|poster|\.png|\bgifs?\b|email template|html email", re.I)
CREATE = re.compile(r"\b(?:create|creating|generate|build|produce|make|making|design)", re.I)
FLAGS = {
    "legacy": r"legacy|deprecated|superseded|backward compatib",
    "needs-image-gen": r"image[- ]generation|generate (?:the )?(?:design )?images?|imagegen|image-direction",
    "platform-bound": r"anthropic's|shopify|polaris|claude\.ai (?:html )?artifacts?|\bslack\b",
    "static-art": r"poster|\.png and \.pdf|p5\.js|visual art|piece of art",
}


def parse_frontmatter(path):
    try:
        lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
    except OSError:
        return {}
    if not lines or lines[0].strip() != "---":
        return {}
    meta, key, block = {}, None, []
    for line in lines[1:]:
        if line.strip() == "---":
            break
        m = re.match(r"^([A-Za-z][\w-]*):\s*(.*)$", line)
        if m and not line.startswith((" ", "\t")):
            if key and block:
                meta[key] = " ".join(s.strip() for s in block if s.strip())
            key, val, block = m.group(1), m.group(2).strip(), []
            if val in ("", ">", ">-", "|", "|-", ">+", "|+"):
                meta[key] = ""
            else:
                meta[key], key = val.strip("'\""), None
        elif key is not None:
            block.append(line)
    if key and block:
        meta[key] = " ".join(s.strip() for s in block if s.strip())
    return meta


def skill_dirs_under(root):
    root = Path(root).expanduser()
    if not root.is_dir():
        return []
    if (root / "SKILL.md").is_file():
        return [root]
    return sorted(p for p in root.iterdir() if (p / "SKILL.md").is_file())


def load_json(path):
    try:
        return json.loads(Path(path).expanduser().read_text())
    except (OSError, ValueError):
        return {}


def enabled_plugins(project, config_dir):
    enabled = {}
    for f in (config_dir / "settings.json", project / ".claude/settings.json",
              project / ".claude/settings.local.json"):
        enabled.update(load_json(f).get("enabledPlugins") or {})
    installed = load_json(config_dir / "plugins/installed_plugins.json").get("plugins") or {}
    for key, on in enabled.items():
        if not on:
            continue
        for inst in installed.get(key) or []:
            ipath = Path(inst.get("installPath") or "")
            if not ipath.is_dir():
                continue
            if inst.get("projectPath") and Path(inst["projectPath"]).resolve() != project:
                continue
            yield key, ipath
            break


def collect(project, extra_roots):
    config_dir = Path(os.environ.get("CLAUDE_CONFIG_DIR", "~/.claude")).expanduser()
    found = {}

    def add(skill_dir, source, plugin=None):
        meta = parse_frontmatter(skill_dir / "SKILL.md")
        name = meta.get("name") or skill_dir.name
        invoke = f"{plugin}:{name}" if plugin else name
        found.setdefault(invoke, dict(
            name=name, invoke=invoke, source=source,
            path=str((skill_dir / "SKILL.md").resolve()),
            description=(meta.get("description") or "")[:700]))

    for d in skill_dirs_under(project / ".claude/skills"):
        add(d, "project")
    for d in skill_dirs_under(config_dir / "skills"):
        add(d, "user")
    for key, ipath in enabled_plugins(project, config_dir):
        manifest = load_json(ipath / ".claude-plugin/plugin.json")
        plugin = manifest.get("name") or key.split("@")[0]
        roots = manifest.get("skills") or ["skills"]
        for r in [roots] if isinstance(roots, str) else roots:
            for d in skill_dirs_under(ipath / r):
                add(d, f"plugin:{plugin}", plugin)
    for root in extra_roots:
        for d in skill_dirs_under(root):
            add(d, f"extra:{root}")
    return list(found.values())


def invokes(path, self_name):
    """True when a skill's own instructions call this skill (e.g. a pipeline built on it)."""
    try:
        body = Path(path).read_text(encoding="utf-8", errors="replace")
    except OSError:
        return False
    body = body.split("---", 2)[-1] if body.startswith("---") else body
    return re.search(rf"(?<![\w-]){re.escape(self_name)}(?![\w-])", body) is not None


def classify(skills, self_name):
    design, media, adjacent, tools, excluded = [], [], [], [], []
    for s in skills:
        if s["name"] == self_name:
            continue
        if invokes(s["path"], self_name):
            excluded.append({**s, "tags": [], "flags": [],
                             "reason": f"invokes {self_name}; seating it would recurse"})
            continue
        text = f"{s['name'].replace('-', ' ')} {s['description']}"
        tags = sorted(t for t, rx in TAGS.items() if re.search(rx, text, re.I))
        flags = sorted(f for f, rx in FLAGS.items() if re.search(rx, text, re.I))
        entry = {**s, "tags": tags, "flags": flags}
        core = CORE.intersection(tags)
        if TOOL.search(text) and len(core) < 2:
            if not NOT_TOOL.search(text):
                tools.append(entry)
            continue
        anchored, negative = ANCHOR.search(text), NEGATIVE.search(text)
        if anchored and core and (len(core) >= 2 or not negative):
            design.append(entry)
        elif MEDIA.search(text) and CREATE.search(text):
            media.append(entry)
        elif anchored and "frontend" in tags and not negative:
            adjacent.append(entry)
    rank = lambda e: (-len(CORE.intersection(e["tags"])), e["invoke"])
    by_name = lambda e: e["invoke"]
    return {"design": sorted(design, key=rank), "media": sorted(media, key=by_name),
            "adjacent": sorted(adjacent, key=rank), "tools": sorted(tools, key=by_name),
            "excluded": sorted(excluded, key=by_name)}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--project", default=".", help="project root (project skills + settings)")
    ap.add_argument("--extra-root", action="append", default=[], help="additional skill root")
    ap.add_argument("--format", choices=["table", "json"], default="table")
    a = ap.parse_args()

    self_name = parse_frontmatter(Path(__file__).resolve().parent.parent / "SKILL.md").get("name", "the-designer-team")
    out = classify(collect(Path(a.project).resolve(), a.extra_root), self_name)
    if a.format == "json":
        json.dump(out, sys.stdout, indent=2)
        print()
        return
    for bucket, items in out.items():
        print(f"\n## {bucket} ({len(items)})")
        for e in items:
            flags = f"  !{','.join(e['flags'])}" if e["flags"] else ""
            why = f"  ({e['reason']})" if e.get("reason") else ""
            print(f"- {e['invoke']}  [{', '.join(e['tags'])}]{flags}{why}\n    {e['path']}")


if __name__ == "__main__":
    main()
