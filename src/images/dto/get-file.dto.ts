import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsNotEmpty, IsString } from 'class-validator'

export class GetFileDto {
	@ApiProperty({ enum: ['original', 'thumbnail'], default: 'thumbnail' })
	@IsString()
	@IsIn(['original', 'thumbnail'])
	@IsNotEmpty()
	type!: 'original' | 'thumbnail'
}
