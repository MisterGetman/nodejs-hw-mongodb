import {
  CONTACT_TYPE_OPTIONS,
  IS_FAVOURITE_OPTIONS,
} from '../constants/index.js';

const parseFilterBy = (key, value) => {
  let knownFilters;

  switch (key) {
    case 'contactType':
      knownFilters = CONTACT_TYPE_OPTIONS;
      break;
    case 'isFavourite':
      knownFilters = IS_FAVOURITE_OPTIONS;
  }

  const isKnownFilter = knownFilters.includes(value);
  if (isKnownFilter) return [value];
  return knownFilters;
};

export const parseFilterParams = (query) => {
  const { type, isFavourite } = query;

  const parsedContactTypeFilter = parseFilterBy('contactType', type);
  const parsedIsFavouriteFilter = parseFilterBy('isFavourite', isFavourite);

  return {
    filterByContactType: { contactType: { $in: parsedContactTypeFilter } },
    filterByIsFavourite: { isFavourite: { $in: parsedIsFavouriteFilter } },
  };
};
