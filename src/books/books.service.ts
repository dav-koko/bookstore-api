import { AllowedSortFields, SortOrder } from '../common/enums';
import { E_BOOK_NOT_FOUND } from '../common/exceptions';
import { DEFAULT_LIMIT } from '../common/constants';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookInputDto } from './dto/inputs/create-book.input.dto';
import { BookResponseDto } from './dto/responses/book.response.dto';
import { UpdateBookInputDto } from './dto/inputs/update-book.input.dto';
import { FindBooksArgsDto } from './dto/args/find-books.args.dto';
import { BooksResponseDto } from './dto/responses/books.response.dto';


@Injectable()
export class BooksService {
    constructor(private readonly prisma: PrismaService) {}

    async createBook(data: CreateBookInputDto): Promise<BookResponseDto> {
        const { title, writer, coverImage, points, tags } = data;

        // Create the book
        const book = await this.prisma.book.create({
            data: {
                title,
                writer,
                coverImage,
                points,
                tags: {
                    connectOrCreate: tags.map(tag => ({
                        where: { name: tag },
                        create: { name: tag },
                    })),
                }
            },
            select: {
                id: true,
                title: true,
                writer: true,
                coverImage: true,
                points: true,
                tags: {
                    select: {
                        name: true
                    }
                }
            }
        });

        return this._transformBookData(book);
    }

    async updateBook(id: number, data: UpdateBookInputDto): Promise<BookResponseDto> {
        const { tags, ...otherData } = data;
    
        const updatedData: any = {
            ...otherData,
        };
    
        // If tags are provided, we handle the relation update
        if (tags) {
            updatedData.tags = {
                set: tags.map(tag => ({ name: tag }))
            };
        }
    
        const book = await this.prisma.book.update({
            where: { id },
            data: updatedData,
            select: {
                id: true,
                title: true,
                writer: true,
                coverImage: true,
                points: true,
                tags: {
                    select: {
                        name: true
                    }
                }
            }
        });
    
        if (!book) {
            throw new NotFoundException(E_BOOK_NOT_FOUND);
        }
    
        return this._transformBookData(book);
    }
    
    async deleteBook(id: number): Promise<BookResponseDto> {
        const book = await this.prisma.book.delete({
            where: { id },
            select: {
                id: true,
                title: true,
                writer: true,
                coverImage: true,
                points: true,
                tags: {
                    select: {
                        name: true
                    }
                }
            }
        });

        if (!book) throw new NotFoundException(E_BOOK_NOT_FOUND);

        return this._transformBookData(book);
    }

    async findAll(args: FindBooksArgsDto): Promise<BooksResponseDto> {
        const {
            limit,
            offset,
            sortField,
            sortOrder,
            searchQuery,
            searchField,
            tags,
            writer
        } = args;
    
        // The where clause
        const where = {
            ...(writer && { writer: { contains: writer } }),
            ...(searchQuery && searchField && { [searchField]: { contains: searchQuery } }),
            ...(searchQuery && !searchField && { title: { contains: searchQuery } }),
            ...(tags && tags.length && {
                tags: {
                    some: {
                        name: {
                            in: tags
                        }
                    }
                }
            })
        };
    
        // Fetch the books
        const books = await this.prisma.book.findMany({
            where,
            skip: offset,
            take: limit,
            orderBy: {
                [sortField || AllowedSortFields.POINTS]: sortOrder || SortOrder.DESC
            },
            select: {
                id: true,
                title: true,
                writer: true,
                coverImage: true,
                points: true,
                tags: {
                    select: {
                        name: true
                    }
                }
            }
        });
    
        // Fetch total books count for pagination metadata
        const count = await this.prisma.book.count({ where });
    
        // Transform the data for the response
        const transformedBooks = books.map(book => {
            return this._transformBookData(book);
        });
    
        // Constructing the final response
        return {
            data: transformedBooks,
            metadata: {
                total: count,
                offset: offset || 0,
                limit: limit || DEFAULT_LIMIT
            }
        };
    }

    async findOne(id: number): Promise<BookResponseDto | null> {
        const book = await this.prisma.book.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                writer: true,
                coverImage: true,
                points: true,
                tags: {
                    select: {
                        name: true
                    }
                }
            }
        });

        if(!book) return null

        return this._transformBookData(book);
    }

    private _transformBookData(book: any): BookResponseDto {
        const transformedTags = book.tags.map(tag => tag.name);
        return {
            id: book.id,
            title: book.title,
            writer: book.writer,
            coverImage: book.coverImage,
            points: book.points,
            tags: transformedTags
        };
    }
}