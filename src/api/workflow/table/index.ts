import { AxiosPromise } from 'axios';
import request from '@/utils/request';
import { TableQuery, TableVo } from '@/api/workflow/table/types';

export const listTable = (query: TableQuery): AxiosPromise<TableVo[]> => {
  return request({
    url: '/workflow/table/list',
    method: 'get',
    params: query
  });
};
