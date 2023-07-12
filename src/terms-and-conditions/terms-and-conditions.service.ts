import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { TermsAndConditionsDto } from '../terms-and-conditions/dtos/T&CDto';
import { FileSystemHelper } from 'src/helpers/file-system/filesystem';

@Injectable()
export class TermsAndConditionsService {
  async getTermsAndConditions() {
    try {
      const content = await FileSystemHelper.readFile(
        '../../assets/files/TermsAndConditions.html',
        {
          encoding: 'utf-8',
        },
      );

      const data = {
        title: 'Terms and Conditions',
        html: content,
      };

      return data;
    } catch (err) {
      return new InternalServerErrorException(err);
    }
  }

  async updateTermsAndConditions(body: TermsAndConditionsDto) {
    try {
      await FileSystemHelper.writeFile(
        '../../assets/files/TermsAndConditions.html',
        body.content,
      );
      return { message: 'terms and conditions are updated successfully' };
    } catch (err) {
      return new InternalServerErrorException(err);
    }
  }
}
