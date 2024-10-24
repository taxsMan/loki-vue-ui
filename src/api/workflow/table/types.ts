/**
 * 获取数据表
 */
export interface TableVo {
  /**
   * 表名称
   */
  TABLE_NAME: string;

  /**
   * 注释
   */
  TABLE_COMMENT: string;
}


export interface TableQuery extends PageQuery {
}
