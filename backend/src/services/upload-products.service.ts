import { BadRequestException, Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { parse, ParseResult } from 'papaparse';
import {
  INVALID_HEADERS_MSG,
  INVALID_FILE_DATA_MSG,
  MISSING_FILE_MSG,
} from 'src/common/constants/errors-messages.constants';
import {
  EXPECTED_HEADERS,
  HEADERS_LENGTH,
} from 'src/common/constants/settings.constants';
import { ParsedProductsResponseI } from 'src/interfaces/parsed-products-response.interface';

@Injectable()
export class UploadProductsService {
  async handleFileUpload(
    file: Express.Multer.File,
  ): Promise<ParsedProductsResponseI[]> {
    if (!file) throw new BadRequestException(MISSING_FILE_MSG);

    if (file.mimetype !== 'text/csv')
      throw new BadRequestException('Invalid file type');

    return this.parseFile(file.path);
  }

  private async parseFile(
    filePath: string,
  ): Promise<ParsedProductsResponseI[]> {
    const file = readFileSync(filePath);
    const fileData = file.toString();

    const parsedFile: ParseResult<ParsedProductsResponseI> = parse(fileData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) =>
        header.toLocaleLowerCase().replace(';', '').trim(),
    });
    await this.validateFileData(parsedFile);
    return parsedFile.data;
  }

  private async validateFileData(
    parsedFile: ParseResult<ParsedProductsResponseI>,
  ) {
    const headers = parsedFile.meta.fields;

    if (
      headers?.length !== HEADERS_LENGTH ||
      JSON.stringify(headers) !== EXPECTED_HEADERS
    )
      throw new BadRequestException(INVALID_HEADERS_MSG);

    if (!parsedFile.data) throw new BadRequestException(INVALID_FILE_DATA_MSG);
  }
}
