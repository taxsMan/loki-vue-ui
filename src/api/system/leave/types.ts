export interface LeaveVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 请假类型
   */
  leaveType: string;

  /**
   * 开始时间
   */
  startDate: string;

  /**
   * 结束时间
   */
  endDate: string;

  /**
   * 请假天数
   */
  leaveDays: number;

  /**
   * 请假原因
   */
  remark: string;

  /**
   * 状态
   */
  status: string;

  /**
   * 
   */
  ids: string | number;

}

export interface LeaveForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 请假类型
   */
  leaveType?: string;

  /**
   * 开始时间
   */
  startDate?: string;

  /**
   * 结束时间
   */
  endDate?: string;

  /**
   * 请假天数
   */
  leaveDays?: number;

  /**
   * 请假原因
   */
  remark?: string;

  /**
   * 状态
   */
  status?: string;

  /**
   * 
   */
  ids?: string | number;

}

export interface LeaveQuery extends PageQuery {

  /**
   * 请假类型
   */
  leaveType?: string;

  /**
   * 开始时间
   */
  startDate?: string;

  /**
   * 结束时间
   */
  endDate?: string;

  /**
   * 请假天数
   */
  leaveDays?: number;

  /**
   * 状态
   */
  status?: string;

  /**
   * 
   */
  ids?: string | number;

    /**
     * 日期范围参数
     */
    params?: any;
}



