import { describe, expect, it } from 'vitest'
import { isBarcode, normalizeOff } from '../../../supabase/functions/_shared/offNormalize'

describe('normalizeOff', () => {
  it('maps OFF nutriments per 100 g, rounding and taking the first brand', () => {
    const food = normalizeOff('3017620422003', {
      status: 1,
      product: {
        product_name: 'Nutella',
        brands: 'Ferrero, Nutella',
        quantity: '400 g',
        serving_quantity: '15',
        nutriments: {
          'energy-kcal_100g': 539,
          proteins_100g: 6.3,
          carbohydrates_100g: 57.5,
          fat_100g: 30.9,
        },
      },
    })
    expect(food).toEqual({
      barcode: '3017620422003',
      name: 'Nutella',
      brand: 'Ferrero',
      per100: { kcal: 539, protein: 6.3, carbs: 57.5, fat: 30.9, fiber: null },
      liquid: false,
      servingGrams: 15,
      missing: [],
    })
  })

  it('derives kcal from kJ, detects drinks and lists missing values', () => {
    const food = normalizeOff('5449000000996', {
      status: 1,
      product: {
        product_name: 'Cola',
        quantity: '33 cl',
        nutriments: { 'energy-kj_100g': 180, carbohydrates_100g: '10,6' },
      },
    })
    expect(food?.per100.kcal).toBe(43)
    expect(food?.per100.carbs).toBe(10.6)
    expect(food?.liquid).toBe(true)
    expect(food?.missing).toEqual(['protein', 'fat'])
  })

  it('treats impossible values (anyone can edit OFF) as missing and trims long names', () => {
    const food = normalizeOff('5400000000001', {
      status: 1,
      product: {
        product_name: 'x'.repeat(300),
        serving_quantity: -3,
        nutriments: {
          'energy-kcal_100g': 1e9,
          proteins_100g: 80,
          carbohydrates_100g: 60,
          fat_100g: 5,
        },
      },
    })
    expect(food?.name).toHaveLength(120)
    expect(food?.servingGrams).toBeNull()
    expect(food?.missing).toEqual(['kcal', 'protein', 'carbs', 'fat'])
  })

  it('returns null for an unknown barcode or an empty product', () => {
    expect(normalizeOff('0000', { status: 0, status_verbose: 'product not found' })).toBeNull()
    expect(normalizeOff('0000', { status: 1, product: { nutriments: {} } })).toBeNull()
  })

  it('accepts only real barcode lengths', () => {
    expect(isBarcode('5449000000996')).toBe(true)
    expect(isBarcode('12345')).toBe(false)
    expect(isBarcode('54490000009x6')).toBe(false)
  })
})
