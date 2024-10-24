import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LeaveVO, LeaveForm, LeaveQuery } from '@/api/system/leave/types';

/**
 * 查询请假申请列表
 * @param query
 * @returns {*}
 */

export const listLeave = (query?: LeaveQuery): AxiosPromise<LeaveVO[]> => {
  return request({
    url: '/system/leave/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询请假申请详细
 * @param id
 */
export const getLeave = (id: string | number): AxiosPromise<LeaveVO> => {
  return request({
    url: '/system/leave/' + id,
    method: 'get'
  });
};

/**
 * 新增请假申请
 * @param data
 */
export const addLeave = (data: LeaveForm) => {
  return request({
    url: '/system/leave',
    method: 'post',
    data: data
  });
};

/**
 * 修改请假申请
 * @param data
 */
export const updateLeave = (data: LeaveForm) => {
  return request({
    url: '/system/leave',
    method: 'put',
    data: data
  });
};

/**
 * 删除请假申请
 * @param id
 */
export const delLeave = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/leave/' + id,
    method: 'delete'
  });
};
