import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductFilterDto,
  CreateCategoryDto,
  CreateCropDto,
  CreatePestDto,
} from './products.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Products (Admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'CONSEILLER')
@Controller('admin/products')
export class ProductsAdminController {
  constructor(private productsService: ProductsService) {}

  @Get()
  findAll(@Query() filters: ProductFilterDto) {
    return this.productsService.findAllAdmin(filters);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }

  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.productsService.createCategory(dto);
  }

  @Post('crops')
  createCrop(@Body() dto: CreateCropDto) {
    return this.productsService.createCrop(dto);
  }

  @Post('pests')
  createPest(@Body() dto: CreatePestDto) {
    return this.productsService.createPest(dto);
  }
}
