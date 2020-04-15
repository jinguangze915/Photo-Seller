import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {

  transform(array: Array<any>, args ? : any): Array<any> {

    if(array == undefined){
      return [];
    }
    let sortDirection = 1;
    if(args.sort === 'desc'){
      sortDirection = -1
    }
    array.sort((item1: any, item2: any) => {
      if (Number(item1[args.property]) < Number(item2[args.property])) {
        return -1 * sortDirection;
      } else if (Number(item1[args.property]) > Number(item2[args.property])) {
        return 1 * sortDirection;
      } else {
        return 0;
      }
    });
    return array;
  }

}
