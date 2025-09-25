import { ApiProperty } from '@nestjs/swagger'

export class CreateImageResponseDto {
	@ApiProperty({ format: 'uuid' })
	id!: string

	@ApiProperty({ enum: ['PENDING'], example: 'PENDING' })
	status!: 'PENDING'
}
