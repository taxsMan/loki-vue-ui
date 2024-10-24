import { parseTime } from '@/utils/ruoyi';


export const parseTimeForMatter = (row,column,cellValue:any,index) => {
  return parseTime(cellValue,'{y}-{m}-{d}');
};
