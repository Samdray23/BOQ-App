import { pricingRepository } from './pricing.repository.js';
import { NotFoundError, BadRequestError } from '../shared/errors.js';
import type { Region, RateEntry } from './pricing.types.js';

export const pricingService = {
  async getRegions(): Promise<Region[]> {
    return pricingRepository.findAllRegions();
  },

  async getRegionByCode(code: string): Promise<Region> {
    const region = await pricingRepository.findRegionByCode(code);
    if (!region) throw new NotFoundError(`Region '${code}' not found`);
    return region;
  },

  async getRatesByRegion(regionCode: string): Promise<RateEntry[]> {
    const region = await this.getRegionByCode(regionCode);
    return pricingRepository.findRatesByRegion(region.id);
  },

  async getRate(itemDescription: string, unit: string, regionCode: string): Promise<number> {
    const region = await this.getRegionByCode(regionCode);
    const rate = await pricingRepository.findRate(region.id, itemDescription, unit);
    if (!rate) {
      // Return default market rate if not found in library
      throw new NotFoundError(`Rate not found for '${itemDescription}' in region '${regionCode}'`);
    }
    return rate.rate;
  },

  async createRate(input: {
    regionCode: string;
    categoryName: string;
    itemDescription: string;
    unit: string;
    rate: number;
    currency?: string;
    source?: string;
  }): Promise<RateEntry> {
    const region = await this.getRegionByCode(input.regionCode);
    const category = await pricingRepository.findCategoryByName(input.categoryName);
    if (!category) throw new BadRequestError(`Category '${input.categoryName}' not found`);

    return pricingRepository.createRate({
      regionId: region.id,
      categoryId: category.id,
      itemDescription: input.itemDescription,
      unit: input.unit,
      rate: input.rate,
      currency: input.currency,
      source: input.source,
    });
  },

  async applyRegionalMarkup(amount: number, regionCode: string): Promise<number> {
    const region = await this.getRegionByCode(regionCode);
    return amount * (1 + region.markup_percentage / 100);
  },
};
