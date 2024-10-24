import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { VersionVO, VersionForm, VersionQuery } from '@/api/system/version/types';

/**
 * 查询版本管理列表
 * @param query
 * @returns {*}
 */

export const listVersion = (query?: VersionQuery): AxiosPromise<VersionVO[]> => {
  return request({
    url: '/system/version/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询版本管理详细
 * @param versionId
 */
export const getVersion = (versionId: string | number): AxiosPromise<VersionVO> => {
  return request({
    url: '/system/version/' + versionId,
    method: 'get'
  });
};

/**
 * 新增版本管理
 * @param data
 */
export const addVersion = (data: VersionForm) => {
  return request({
    url: '/system/version',
    method: 'post',
    data: data
  });
};

/**
 * 修改版本管理
 * @param data
 */
export const updateVersion = (data: VersionForm) => {
  return request({
    url: '/system/version',
    method: 'put',
    data: data
  });
};

/**
 * 删除版本管理
 * @param versionId
 */
export const delVersion = (versionId: string | number | Array<string | number>) => {
  return request({
    url: '/system/version/' + versionId,
    method: 'delete'
  });
};
