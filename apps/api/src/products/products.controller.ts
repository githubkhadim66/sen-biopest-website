import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ProductFilterDto } from './products.dto';

@ApiTags('Products (Public)')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  findAll(@Query() filters: ProductFilterDto) {
    return this.productsService.findAll(filters);
  }

  @Get('categories')
  getCategories() {
    return this.productsService.getCategories();
  }

  @Get('crops')
  getCrops() {
    return this.productsService.getCrops();
  }

  @Get('pests')
  getPests() {
    return this.productsService.getPests();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }
}
