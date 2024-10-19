import { ContactsCollection } from '../db/models/contact.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import {
  SORT_ORDER,
  CONTACT_TYPE_OPTIONS,
  IS_FAVOURITE_OPTIONS,
} from '../constants/index.js';

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortBy = '_id',
  sortOrder = SORT_ORDER.ASC,
  filterByContactType = { contactType: { $in: CONTACT_TYPE_OPTIONS } },
  filterByIsFavourite = { isFavourite: { $in: IS_FAVOURITE_OPTIONS } },
  userId,
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;
  const filters = {
    ...filterByContactType,
    ...filterByIsFavourite,
    userId,
  };

  const contactsQuery = ContactsCollection.find(filters);

  const [contactsCount, contacts] = await Promise.all([
    ContactsCollection.find(filters).merge(contactsQuery).countDocuments(),
    contactsQuery
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .exec(),
  ]);

  const paginationData = calculatePaginationData(contactsCount, perPage, page);

  return {
    ...paginationData,
    data: contacts,
  };
};

export const getContactById = (contactId, userId) =>
  ContactsCollection.findOne({ _id: contactId, userId });

export const createContact = (contactData) =>
  ContactsCollection.create(contactData);

export const updateContact = (contactId, contactData, userId) =>
  ContactsCollection.findOneAndUpdate({ _id: contactId, userId }, contactData, {
    new: true,
  });

export const deleteContact = (contactId, userId) =>
  ContactsCollection.findOneAndDelete({ _id: contactId, userId });
