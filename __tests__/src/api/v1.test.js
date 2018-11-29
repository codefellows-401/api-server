'use strict';

// dynamic? Maybe put this in an array an repeat all tests ...
process.env.STORAGE = 'mongo';

const server = require('../../../src/app.js').server;

const supergoose = require('../../supergoose.js');

const mockRequest = supergoose.server(server);

beforeAll(supergoose.startDB);
afterAll(supergoose.stopDB);

// Unmock our model (might have been mocked by a previous test)
jest.unmock('require-directory');

describe('api server', () => {

  it('should respond with a 500 on an invalid model', () => {

    return mockRequest
      .get('/booboo')
      .then(results => {
        expect(results.status).toBe(404);
      })
      .catch(err => {
        expect(err).not.toBeDefined();
      });

  });

  it('should respond with a 404 on an invalid method', () => {

    return mockRequest
      .post('/api/v1/foo/12')
      .then(results => {
        expect(results.status).toBe(404);
      })
      .catch(err => {
        expect(err).not.toBeDefined();
      });

  });

  it('should respond properly on a get request to a valid model', () => {

    return mockRequest
      .get('/api/v1/articles')
      .then(results => {
        expect(results.status).toBe(200);
      })
      .catch(err => {
        expect(err).not.toBeDefined();
      });

  });

  it('should be able to post to /api/v1/articles', ()  => {

    let obj = {title:'foo', article:'some text', author:'person'};

    return mockRequest
      .post('/api/v1/articles')
      .send(obj)
      .then(results => {
        expect(results.status).toBe(200);
        expect(results.body.text).toEqual(obj.text);
      })
      .catch( err => console.error('err', err) );

  });


  it('following a post, should find a single record', () => {

    let obj = {title:'foo', article:'some text', author:'person'};

    return mockRequest
      .post('/api/v1/articles')
      .send(obj)
      .then(results => {
        return mockRequest.get(`/api/v1/articles/${results.body._id}`)
          .then(list => {
            expect(list.body.text).toEqual(obj.text);
            expect(list.status).toBe(200);
          });
      })
      .catch( err => console.error('err', err) );

  });

  it('following multiple posts, should return the correct count', () => {

    return mockRequest
      .get('/api/v1/articles')
      .then(results => {
        expect(results.body.count).toEqual(2);
        expect(results.status).toBe(200);
      })
      .catch(err => {
        expect(err).not.toBeDefined();
      });

  });

});


