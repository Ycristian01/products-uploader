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
  /**
   * Handles the uploaded CSV file: validates it and parses its contents.
   *
   * @param file - The uploaded file object (from Multer).
   * @returns A promise resolving to an array of parsed product objects.
   * @throws BadRequestException if the file is missing or has an invalid type.
   */
  async handleFileUpload(
    file: Express.Multer.File,
  ): Promise<ParsedProductsResponseI[]> {
    if (!file) throw new BadRequestException(MISSING_FILE_MSG);

    if (file.mimetype !== 'text/csv')
      throw new BadRequestException('Invalid file type');

    return this.parseFile(file.path);
  }

  /**
   * Reads and parses a CSV file from the file system.
   *
   * @param filePath - The full path to the CSV file.
   * @returns Parsed product data from the CSV file.
   * @throws BadRequestException if the file contents or headers are invalid.
   */
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

  /**
   * Validates the structure and data of the parsed CSV file.
   *
   * @param parsedFile - The result of parsing the CSV using `papaparse`.
   * @throws BadRequestException if the headers are incorrect or data is missing.
   */
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
