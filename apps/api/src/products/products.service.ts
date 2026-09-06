import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductFilterDto,
  CreateCategoryDto,
  CreateCropDto,
  CreatePestDto,
} from './products.dto';
import slugify from 'slugify';

const productInclude = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  crops: { include: { crop: true } },
  pests: { include: { pest: true } },
  tags: { include: { tag: true } },
  faq: { orderBy: { sortOrder: 'asc' as const } },
};

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: ProductFilterDto) {
    const { search, category, crop, pest, tag, availability, featured, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { isPublished: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = { slug: category };
    if (crop) where.crops = { some: { crop: { slug: crop } } };
    if (pest) where.pests = { some: { pest: { slug: pest } } };
    if (tag) where.tags = { some: { tag: { slug: tag } } };
    if (availability) where.availability = availability;
    if (featured) where.isFeatured = true;

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: productInclude,
        skip,
        take: limit,
        orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: data.map(this.formatProduct),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllAdmin(filters: ProductFilterDto) {
    const { search, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: productInclude,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: data.map(this.formatProduct),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: productInclude,
    });
    if (!product) throw new NotFoundException('Produit introuvable');

    const relatedProducts = await this.prisma.product.findMany({
      where: {
        isPublished: true,
        id: { not: product.id },
        OR: [
          { categoryId: product.categoryId },
          { crops: { some: { cropId: { in: product.crops.map((c) => c.cropId) } } } },
        ],
      },
      include: productInclude,
      take: 4,
    });

    return {
      ...this.formatProduct(product),
      relatedProducts: relatedProducts.map(this.formatProduct),
    };
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });
    if (!product) throw new NotFoundException('Produit introuvable');
    return this.formatProduct(product);
  }

  async create(dto: CreateProductDto) {
    const slug = slugify(dto.name, { lower: true, strict: true });

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        shortDescription: dto.shortDescription,
        description: dto.description,
        benefits: dto.benefits || [],
        activeIngredients: dto.activeIngredients || [],
        dosage: dto.dosage,
        applicationMethod: dto.applicationMethod,
        precautions: dto.precautions,
        packaging: dto.packaging,
        availability: dto.availability || 'Disponible',
        isFeatured: dto.isFeatured || false,
        isPublished: dto.isPublished ?? true,
        categoryId: dto.categoryId,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        crops: dto.cropIds
          ? { create: dto.cropIds.map((cropId) => ({ cropId })) }
          : undefined,
        pests: dto.pestIds
          ? { create: dto.pestIds.map((pestId) => ({ pestId })) }
          : undefined,
        tags: dto.tagIds
          ? { create: dto.tagIds.map((tagId) => ({ tagId })) }
          : undefined,
        images: dto.imageUrls
          ? {
              create: dto.imageUrls.map((url, index) => ({
                url,
                isPrimary: index === 0,
                sortOrder: index,
              })),
            }
          : undefined,
      },
      include: productInclude,
    });

    return this.formatProduct(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findById(id);

    if (dto.cropIds) {
      await this.prisma.cropOnProduct.deleteMany({ where: { productId: id } });
    }
    if (dto.pestIds) {
      await this.prisma.pestOnProduct.deleteMany({ where: { productId: id } });
    }
    if (dto.tagIds) {
      await this.prisma.tagOnProduct.deleteMany({ where: { productId: id } });
    }
    if (dto.imageUrls) {
      await this.prisma.productImage.deleteMany({ where: { productId: id } });
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.name ? slugify(dto.name, { lower: true, strict: true }) : undefined,
        shortDescription: dto.shortDescription,
        description: dto.description,
        benefits: dto.benefits,
        activeIngredients: dto.activeIngredients,
        dosage: dto.dosage,
        applicationMethod: dto.applicationMethod,
        precautions: dto.precautions,
        packaging: dto.packaging,
        availability: dto.availability,
        isFeatured: dto.isFeatured,
        isPublished: dto.isPublished,
        categoryId: dto.categoryId,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        crops: dto.cropIds
          ? { create: dto.cropIds.map((cropId) => ({ cropId })) }
          : undefined,
        pests: dto.pestIds
          ? { create: dto.pestIds.map((pestId) => ({ pestId })) }
          : undefined,
        tags: dto.tagIds
          ? { create: dto.tagIds.map((tagId) => ({ tagId })) }
          : undefined,
        images: dto.imageUrls
          ? {
              create: dto.imageUrls.map((url, index) => ({
                url,
                isPrimary: index === 0,
                sortOrder: index,
              })),
            }
          : undefined,
      },
      include: productInclude,
    });

    return this.formatProduct(product);
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.product.delete({ where: { id } });
    return { message: 'Produit supprimé' };
  }

  // Categories
  async getCategories() {
    return this.prisma.productCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: true } } },
    });
  }

  async createCategory(dto: CreateCategoryDto) {
    const slug = slugify(dto.name, { lower: true, strict: true });
    return this.prisma.productCategory.create({
      data: { name: dto.name, slug, description: dto.description },
    });
  }

  // Crops
  async getCrops() {
    return this.prisma.crop.findMany({ orderBy: { name: 'asc' } });
  }

  async createCrop(dto: CreateCropDto) {
    const slug = slugify(dto.name, { lower: true, strict: true });
    return this.prisma.crop.create({ data: { name: dto.name, slug } });
  }

  // Pests
  async getPests() {
    return this.prisma.pest.findMany({ orderBy: { name: 'asc' } });
  }

  async createPest(dto: CreatePestDto) {
    const slug = slugify(dto.name, { lower: true, strict: true });
    return this.prisma.pest.create({ data: { name: dto.name, slug } });
  }

  private formatProduct(product: any) {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      description: product.description,
      benefits: product.benefits,
      activeIngredients: product.activeIngredients,
      dosage: product.dosage,
      applicationMethod: product.applicationMethod,
      precautions: product.precautions,
      packaging: product.packaging,
      availability: product.availability,
      isFeatured: product.isFeatured,
      isPublished: product.isPublished,
      primaryImage: product.images?.find((i: any) => i.isPrimary)?.url || product.images?.[0]?.url || null,
      images: product.images || [],
      category: product.category
        ? { id: product.category.id, name: product.category.name, slug: product.category.slug }
        : null,
      crops: product.crops?.map((c: any) => c.crop.name) || [],
      pests: product.pests?.map((p: any) => p.pest.name) || [],
      tags: product.tags?.map((t: any) => t.tag.name) || [],
      faq: product.faq || [],
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      createdAt: product.createdAt,
    };
  }
}
