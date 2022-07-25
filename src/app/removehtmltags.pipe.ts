import { Pipe, PipeTransform } from '@angular/core';

//Pipe personalizado para remover contenido html de la API
@Pipe({
  name: 'removehtmltag',
})
export class RemovehtmltagPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: string) {
           if(value){
               const result = value.replace(/<\/?[^>]+>/gi, ''); //removing html tag using regex pattern
              return result;
           }
           else{}


  }
}
