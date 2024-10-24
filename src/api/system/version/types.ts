export interface VersionVO {
  /**
   * 
   */
  versionId: string | number;

  /**
   * 版本标题
   */
  title: string;

  /**
   * 版本内容
   */
  content: string;

}

export interface VersionForm extends BaseEntity {
  /**
   * 
   */
  versionId?: string | number;

  /**
   * 版本标题
   */
  title?: string;

  /**
   * 版本内容
   */
  content?: string;

}

export interface VersionQuery extends PageQuery {

  /**
   * 版本标题
   */
  title?: string;

  /**
   * 版本内容
   */
  content?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



