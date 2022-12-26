/*eslint import/named: "off" */
import { Schema, String } from 'fastest-validator-decorators';

@Schema()
export class PresignedPutUrlEntity {
    @String()
    tail!: string;
}
