import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConsentDto } from './dtos/consentDto';
import { FileSystemHelper } from 'src/helpers/file-system/filesystem';

@Injectable()
export class ConsentService {
  async updateConsent(body: ConsentDto) {
    try {
      await FileSystemHelper.writeFile(
        '../../assets/files/consent.html',
        body.content,
      );

      return { message: 'consent is updated successfully' };
    } catch (err) {
      return new InternalServerErrorException(err);
    }
  }

  async getConsent() {
    try {
      const content = await FileSystemHelper.readFile(
        '../../assets/files/consent.html',
        {
          encoding: 'utf-8',
        },
      );

      const data = {
        title: 'Consent',
        html: content,
      };

      return data;
    } catch (err) {
      return new InternalServerErrorException(err);
    }
  }
}
