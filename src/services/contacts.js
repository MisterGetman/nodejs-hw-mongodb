import createHttpError from 'http-errors';

import { ContactsCollection } from '../db/models/contact.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import {
  SORT_ORDER,
  CONTACT_TYPE_OPTIONS,
  IS_FAVOURITE_OPTIONS,
} from '../constants/index.js';

const authorize_action = async (action, contactId, userId) => {
  const contact = await ContactsCollection.findById(contactId);

  if (!contact) throw createHttpError(404, 'Contact not found');
  if (contact.userId.toString() !== userId.toString())
    throw createHttpError(403, `Forbidden to ${action} this contact.`);

  return contact;
};

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

export const getContactById = async (contactId, userId) => {
  const contact = await authorize_action('get', contactId, userId);

  return contact;
};

export const createContact = (contactData) =>
  ContactsCollection.create(contactData);

export const updateContact = async (contactId, contactData, userId) => {
  await authorize_action('patch', contactId, userId);

  return ContactsCollection.findByIdAndUpdate(contactId, contactData, {
    new: true,
  });
};

export const deleteContact = async (contactId, userId) => {
  await authorize_action('delete', contactId, userId);

  await ContactsCollection.findByIdAndDelete(contactId);
};
