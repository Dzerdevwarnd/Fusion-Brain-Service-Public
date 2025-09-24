import { Body, Controller, Get, Param, Post, Query, Res, StreamableFile } from '@nestjs/common'
import {
	ApiBadRequestResponse,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiOperation,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger'
import { Response } from 'express'
import { CreateImageDto } from './dto/create-image.dto'
import { GetFileDto } from './dto/get-file.dto'
import { ImagesService } from './images.service'

@ApiTags('images')
@Controller('images')
export class ImagesController {
	constructor(private readonly images: ImagesService) {}

	@Get('styles')
	@ApiOperation({ summary: 'Get available styles for validation' })
	@ApiOkResponse({ description: 'List of available styles' })
	async styles() {
		return this.images.getStyles()
	}

	@Get('availability')
	@ApiOperation({ summary: 'Check Fusion Brain pipeline availability' })
	@ApiOkResponse({ description: 'Pipeline availability status' })
	async availability() {
		return this.images.checkAvailability()
	}

	@Post()
	@ApiOperation({ summary: 'Create image generation task' })
	@ApiCreatedResponse({ description: 'Task created' })
	@ApiBadRequestResponse({ description: 'Validation error' })
	async create(@Body() dto: CreateImageDto) {
		return this.images.create(dto.prompt, dto.style)
	}

	@Get(':id/file')
	@ApiOperation({ summary: 'Get generated image file' })
	@ApiQuery({ name: 'type', enum: ['original', 'thumbnail'], required: true })
	@ApiOkResponse({ description: 'Image file stream' })
	async getFile(@Param('id') id: string, @Query() query: GetFileDto, @Res({ passthrough: true }) res: Response) {
		const { stream, filename } = await this.images.getFile(id, query.type)
		res.setHeader('Content-Disposition', `inline; filename="${filename}"`)
		return new StreamableFile(stream)
	}

	@Get('thumbnails')
	@ApiOperation({ summary: 'List images with thumbnail and original URLs' })
	@ApiOkResponse({ description: 'List of images with pagination' })
	async list(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
		return this.images.list(Number(page) || 1, Number(pageSize) || 20)
	}
}
