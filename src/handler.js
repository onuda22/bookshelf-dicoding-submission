const { nanoid } = require('nanoid');
const books = require('./books');

const saveBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const method = 'menambahkan';

  const validationError = validateBookPayload({ method, ...request.payload });
  if (validationError) {
    const response = h.response({
      status: validationError.status,
      message: validationError.message,
    });
    response.code(validationError.code);
    return response;
  }

  const id = nanoid(16);
  const finished = pageCount !== readPage ? false : true;
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;

  const filterBooks = (books) => {
    let result = books;

    if (name !== undefined) {
      result = result.filter((book) =>
        book.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    if (reading !== undefined) {
      const isReading = reading === '1';
      result = result.filter((book) => book.reading === isReading);
    }

    if (finished !== undefined) {
      const isFinished = finished === '1';
      result = result.filter((book) => book.finished === isFinished);
    }

    return result;
  };

  const booksDTO = books.map(({ id, name, publisher, reading, finished }) => ({
    id,
    name,
    publisher,
    reading,
    finished,
  }));

  const filteredBooks = filterBooks(booksDTO);
  const responseBooksDTO = filteredBooks.map(({ id, name, publisher }) => ({
    id,
    name,
    publisher,
  }));

  const response = h.response({
    status: 'success',
    data: {
      books: responseBooksDTO,
    },
  });
  response.code(200);
  return response;
};

const getOneBookDetailHandler = (request, h) => {
  const { bookId } = request.params;
  const book = books.find((b) => b.id === bookId);

  if (book !== undefined) {
    const response = h.response({
      status: 'success',
      data: {
        book,
      },
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

/**
 * Edit Book By Id
 * @param {name, year, author, summary, publisher, pageCount, readPage, reading} request
 * @param {bookId} h
 * @returns response
 */

const editBookByIdHandler = (request, h) => {
  try {
    const { bookId } = request.params;

    const index = books.findIndex((book) => book.id === bookId);

    if (index === -1) {
      const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Id tidak ditemukan',
      });
      response.code(404);
      return response;
    }

    const {
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
    } = request.payload;
    const updatedAt = new Date().toISOString();
    const method = 'memperbarui';

    const validationError = validateBookPayload({ method, ...request.payload });
    if (validationError) {
      const response = h.response({
        status: validationError.status,
        message: validationError.message,
      });
      response.code(validationError.code);
      return response;
    }

    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  } catch (error) {
    const response = h.response({
      status: 'error',
      message: `Terjadi kesalahan pada server ${error}`,
    });
    response.code(500);
    return response;
  }
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const index = books.findIndex((book) => book.id === bookId);
  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

const validateBookPayload = ({ method, name, readPage, pageCount }) => {
  if (!name || name.trim() === '') {
    return {
      status: 'fail',
      message: `Gagal ${method} buku. Mohon isi nama buku`,
      code: 400,
    };
  }

  if (readPage > pageCount) {
    return {
      status: 'fail',
      message: `Gagal ${method} buku. readPage tidak boleh lebih besar dari pageCount`,
      code: 400,
    };
  }

  return null;
};

module.exports = {
  saveBookHandler,
  getAllBooksHandler,
  getOneBookDetailHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
