import { useEffect, useState } from "react";
import useDebouncedSearch from "./useDebouncedSearch";
import { getQueryFromObject } from "../utils";
import api, { getAuthHeader } from "../utils/api";
import notify from "../utils/notify";

export const useListingApi = <T>(
  url: string,
  token: any,
  config?: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortColumn?: string;
    sortDirection?: "asc" | "desc";
    extraParams?: Record<string, any>;
    transformData?: (data: any) => {
      data: T[];
      totalCount: number;
    };
    idExtractor?: (data: T) => any;
  }
) => {
  const [page, setPage] = useState(config?.page || 1);
  const [pageSize, setPageSize] = useState(config?.pageSize || 10);
  const [isInitialLoad, setIsInitialLoad] = useState(false);

  const [data, setData] = useState<T[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [recallCount, setRecallCount] = useState(0);
  const [extraParams, setExtraParams] = useState(config?.extraParams || {});
  const [sortColumn, setSortColumn] = useState(config?.sortColumn || "");
  const [sortDirection, setSortDirection] = useState(config?.sortDirection || "asc");

  const fetchData = (search: string = "") => {
    setLoading(true);
    let apiUrl = `${url}?page=${page}&pageSize=${pageSize}`;

    if (search) {
      apiUrl += `&search=${search}`;
    }

    if (sortColumn && sortDirection) {
      apiUrl += `&sortColumn=${sortColumn}&sortDirection=${sortDirection}`;
    }

    if (extraParams) {
      apiUrl += "&" + getQueryFromObject(extraParams);
    }

    api
      .get<any>(apiUrl, getAuthHeader(token))
      .then((res) => {
        if (res.failed) {
          notify.error(res.message);
          return;
        }

        if (config?.transformData) {
          const { data, totalCount } = config.transformData(res?.data);
          setData(data);
          setTotalCount(totalCount);
        } else {
          throw new Error("No transform data function provided");
        }
      })
      .finally(() => {
        setLoading(false);
        setIsInitialLoad(true);
      });
  };

  const { search, setSearch } = useDebouncedSearch((search) => {
    if (!isInitialLoad) return;
    fetchData(search);
  });

  useEffect(() => {
    if (loading) return;
    fetchData();
  }, [page, pageSize, recallCount, extraParams, sortColumn, sortDirection]);

  const recall = () => {
    setRecallCount((p) => p + 1);
  };

  const add = (data: T) => {
    setData((prev) => [data, ...prev]);
    setTotalCount((p) => p + 1);
  };

  const update = (id: any, updateCallback: (data: T) => T) => {
    if (!config?.idExtractor) return;
    setData((prev) => prev.map((p) => (config.idExtractor!(p) === id ? updateCallback(p) : p)));
  };

  const remove = (id: any) => {
    if (!config?.idExtractor) return;
    setData((prev) => prev.filter((p) => config.idExtractor!(p) !== id));
    setTotalCount((p) => p - 1);
  };

  return {
    data,
    page,
    loading,
    search,
    pageSize,
    totalCount,
    extraParams,
    sortColumn,
    sortDirection,

    // Setters
    setPage,
    setSearch,
    setPageSize,
    setExtraParams,
    setSortColumn,
    setSortDirection,
    // Functions
    setData,
    recall,
    add,
    update,
    remove,
  };
};
