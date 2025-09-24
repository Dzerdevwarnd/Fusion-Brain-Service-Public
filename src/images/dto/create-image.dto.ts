import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CreateImageDto {
	@ApiProperty({ description: 'Text prompt for generation', maxLength: 2000 })
	@IsString()
	@IsNotEmpty()
	@MaxLength(2000)
	prompt!: string

	@ApiProperty({ description: 'Style name', example: 'photorealistic' })
	@IsString()
	@IsNotEmpty()
	style!: string
}
