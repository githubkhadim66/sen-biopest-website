import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductFilterDto,
  CreateCategoryDto,
  CreateCropDto,
  CreatePestDto,
} from './products.dto';
import { paginate } from '../common/dto/pagination.dto';
import slugify from 'slugify';

const productInclude = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  crops: { include: { crop: true } },
  pests: { include: { pest: true } },
  tags: { include: { tag: true } },
  faq: { orderBy: { sortOrder: 'asc' as const } },
} satisfies Prisma.ProductInclude;

// Lighter payload for listing cards (no FAQ / tags)
const productListInclude = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  crops: { include: { crop: true } },
  pests: { include: { pest: true } },
} satisfies Prisma.ProductInclude;

const toSlug = (value: string) => slugify(value, { lower: true, strict: true });

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: ProductFilterDto) {
    const { search, category, crop, pest, tag, availability, featured, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = { isPublished: true };

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
        include: productListInclude,
        skip,
        take: limit,
        orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.product.count({ where }),
    ]);

    return paginate(data.map((p) => this.formatProduct(p)), total, page, limit);
  }

  async findAllAdmin(filters: ProductFilterDto) {
    const { search, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = {};
    if (search) {
      where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
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

    return paginate(data.map((p) => this.formatProduct(p)), total, page, limit);
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, isPublished: true },
      include: productInclude,
    });
    if (!product) throw new NotFoundException('Produit introuvable');

    const relatedProducts = await this.prisma.product.findMany({
      where: {
        isPublished: true,
        id: { not: product.id },
        OR: [
          ...(product.categoryId ? [{ categoryId: product.categoryId }] : []),
          { crops: { some: { cropId: { in: product.crops.map((c) => c.cropId) } } } },
        ],
      },
      include: productListInclude,
      take: 4,
    });

    return {
      ...this.formatProduct(product),
      relatedProducts: relatedProducts.map((p) => this.formatProduct(p)),
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
    const slug = await this.uniqueSlug(dto.name);

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
        availability: dto.availability || 'EN_STOCK',
        isFeatured: dto.isFeatured || false,
        isPublished: dto.isPublished ?? true,
        categoryId: dto.categoryId,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        crops: dto.cropIds ? { create: dto.cropIds.map((cropId) => ({ cropId })) } : undefined,
        pests: dto.pestIds ? { create: dto.pestIds.map((pestId) => ({ pestId })) } : undefined,
        tags: dto.tagIds ? { create: dto.tagIds.map((tagId) => ({ tagId })) } : undefined,
        images: dto.imageUrls ? { create: this.imageRows(dto.imageUrls) } : undefined,
      },
      include: productInclude,
    });

    return this.formatProduct(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.findById(id);
    const slug =
      dto.name && dto.name !== existing.name ? await this.uniqueSlug(dto.name, id) : undefined;

    // Relations are replaced as a whole: run deletes + update atomically
    const product = await this.prisma.$transaction(async (tx) => {
      if (dto.cropIds) await tx.cropOnProduct.deleteMany({ where: { productId: id } });
      if (dto.pestIds) await tx.pestOnProduct.deleteMany({ where: { productId: id } });
      if (dto.tagIds) await tx.tagOnProduct.deleteMany({ where: { productId: id } });
      if (dto.imageUrls) await tx.productImage.deleteMany({ where: { productId: id } });

      return tx.product.update({
        where: { id },
        data: {
          name: dto.name,
          slug,
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
          crops: dto.cropIds ? { create: dto.cropIds.map((cropId) => ({ cropId })) } : undefined,
          pests: dto.pestIds ? { create: dto.pestIds.map((pestId) => ({ pestId })) } : undefined,
          tags: dto.tagIds ? { create: dto.tagIds.map((tagId) => ({ tagId })) } : undefined,
          images: dto.imageUrls ? { create: this.imageRows(dto.imageUrls) } : undefined,
        },
        include: productInclude,
      });
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
      include: { _count: { select: { products: { where: { isPublished: true } } } } },
    });
  }

  async createCategory(dto: CreateCategoryDto) {
    return this.prisma.productCategory.create({
      data: { name: dto.name, slug: toSlug(dto.name), description: dto.description },
    });
  }

  // Crops
  async getCrops() {
    return this.prisma.crop.findMany({ orderBy: { name: 'asc' } });
  }

  async createCrop(dto: CreateCropDto) {
    return this.prisma.crop.create({ data: { name: dto.name, slug: toSlug(dto.name) } });
  }

  // Pests
  async getPests() {
    return this.prisma.pest.findMany({ orderBy: { name: 'asc' } });
  }

  async createPest(dto: CreatePestDto) {
    return this.prisma.pest.create({ data: { name: dto.name, slug: toSlug(dto.name) } });
  }

  private imageRows(urls: string[]) {
    return urls.map((url, index) => ({ url, isPrimary: index === 0, sortOrder: index }));
  }

  /** "AromaProtect" -> "aromaprotect", then "aromaprotect-2" if already taken */
  private async uniqueSlug(name: string, excludeId?: string) {
    const base = toSlug(name) || 'produit';
    const taken = await this.prisma.product.findMany({
      where: { slug: { startsWith: base }, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { slug: true },
    });
    const slugs = new Set(taken.map((p) => p.slug));
    if (!slugs.has(base)) return base;
    let n = 2;
    while (slugs.has(`${base}-${n}`)) n++;
    return `${base}-${n}`;
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
      primaryImage:
        product.images?.find((i: any) => i.isPrimary)?.url || product.images?.[0]?.url || null,
      images: product.images || [],
      category: product.category
        ? { id: product.category.id, name: product.category.name, slug: product.category.slug }
        : null,
      crops: product.crops?.map((c: any) => c.crop.name) || [],
      cropIds: product.crops?.map((c: any) => c.cropId) || [],
      pests: product.pests?.map((p: any) => p.pest.name) || [],
      pestIds: product.pests?.map((p: any) => p.pestId) || [],
      tags: product.tags?.map((t: any) => t.tag.name) || [],
      faq: product.faq || [],
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      createdAt: product.createdAt,
    };
  }
}
