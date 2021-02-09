import { jest } from '@jest/globals'
import { ActiveRecord, is } from '../'

class Product extends ActiveRecord {
  static config = {
    table: "products",
    fields: {
      name: 'string',
      price: 'number'
    },
    validate: {
      name: is.required()
    }
  }
}

let client

beforeEach(() => {
  client = {
    from: jest.fn(() => client),
    insert: jest.fn(() => client),
  }
  ActiveRecord.client = client
})

describe('creating with save', () => {
  test('when valid', async () => {
    const product = new Product({name: "T-Shirt", price: 99})

    expect(product.isPersisted).toBe(false)
    expect(product.isDirty).toBe(true)
    expect(product.isNewRecord).toBe(true)

    const result = await product.save()

    expect(result).toEqual({
      valid: true,
      errors: {}
    })
    expect(client.from).toBeCalledWith('products')
    expect(client.insert).toBeCalledWith({name: "T-Shirt", price: 99})
    expect(product.isNewRecord).toBe(false)
    expect(product.isPersisted).toBe(true)
    expect(product.isDirty).toBe(false)
  })

  test('when invalid', async () => {
    const product = new Product()
    const result = await product.save()

    expect(result).toEqual({
      valid: false,
      errors: {
        name: [ 'is required' ]
      }
    })
    expect(client.insert).not.toBeCalled()
    expect(product.isNewRecord).toBe(true)
    expect(product.isPersisted).toBe(false)
    expect(product.isDirty).toBe(true)
  })
})

describe('creating with factory', () => {
  test('when valid', async () => {
    const { valid, record: product, errors } = await Product.create({
      name: "T-Shirt",
      price: 99
    })

    expect(valid).toBe(true)
    expect(errors).toEqual({})
    expect(product).not.toBe(null)
    expect(client.from).toBeCalledWith('products')
    expect(client.insert).toBeCalledWith({name: "T-Shirt", price: 99})
    expect(product.isNewRecord).toBe(false)
    expect(product.isPersisted).toBe(true)
    expect(product.isDirty).toBe(false)
  })

  test('when invalid', async () => {
    const {valid, errors, record: product} = await Product.create()

    expect(valid).toBe(false)
    expect(errors).toEqual({
      name: [ 'is required' ]
    })
    expect(product).not.toBe(null)
    expect(client.insert).not.toBeCalled()
    expect(product.isNewRecord).toBe(true)
    expect(product.isPersisted).toBe(false)
    expect(product.isDirty).toBe(true)
  })
})