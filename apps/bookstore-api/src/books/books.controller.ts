import { UserAuthGuard } from './../auth/user-auth.guard';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CreateBookInputDto } from './dto/inputs/create-book.input.dto';
import { UpdateBookInputDto } from './dto/inputs/update-book.input.dto';
import { FindBooksArgsDto } from './dto/args/find-books.args.dto';
import { BookResponseDto } from './dto/responses/book.response.dto';
import { BooksResponseDto } from './dto/responses/books.response.dto';
import { BooksService } from './books.service';

@ApiTags('books')
@Controller('books')
export class BooksController {
    constructor(private readonly booksService: BooksService) {}

    @UseGuards(UserAuthGuard) // TODO: Normally we shall privileges/roles on who can register, delete, update,...  a book
    @Post()
    @ApiOperation({ summary: 'Register a new book' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Book registered successfully', type: BookResponseDto })
    async create(@Body() createBookDto: CreateBookInputDto): Promise<BookResponseDto> {
        return this.booksService.createBook(createBookDto);
    }

    @UseGuards(UserAuthGuard)
    @Put(':id')
    @ApiOperation({ summary: 'Update book details' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Book updated successfully', type: BookResponseDto })
    async update(@Param('id') id: number, @Body() updateBookDto: UpdateBookInputDto): Promise<BookResponseDto> {
        return this.booksService.updateBook(id, updateBookDto);
    }

    @UseGuards(UserAuthGuard)
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a book by ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Book deleted successfully', type: BookResponseDto })
    async delete(@Param('id') id: number): Promise<BookResponseDto> {
    const deletedBook = await this.booksService.deleteBook(id);
        return deletedBook;
    }

    @Get()
    @ApiOperation({ summary: 'Retrieve a list of books' })
    @ApiResponse({ status: HttpStatus.OK, description: 'List of books fetched successfully', type: BooksResponseDto })
    @ApiQuery({ type: FindBooksArgsDto, required: false })
    async findAll(@Query() findBooksArgsDto: FindBooksArgsDto): Promise<BooksResponseDto> {
        return this.booksService.findAll(findBooksArgsDto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Retrieve a book by ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Book fetched successfully', type: BookResponseDto })
    async findOne(@Param('id') id: number): Promise<BookResponseDto> {
        return this.booksService.findOne(id);
    }
}
