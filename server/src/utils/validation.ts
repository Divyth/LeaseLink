import type { ZodIssue } from 'zod';

const fieldLabel: Record<string, string> = {
  name: 'name',
  email: 'email',
  password: 'password',
  role: 'account type',
  university: 'university',
  phone: 'phone number',
  title: 'title',
  description: 'description',
  address: 'street address',
  city: 'city',
  state: 'state',
  zip: 'ZIP code',
  latitude: 'latitude',
  longitude: 'longitude',
  rent: 'monthly rent',
  deposit: 'deposit',
  bedrooms: 'bedrooms',
  bathrooms: 'bathrooms',
  areaSqft: 'area',
  propertyType: 'property type',
  leaseTerm: 'lease term',
  availableFrom: 'available date',
  amenities: 'amenities'
};

function labelForPath(path: Array<string | number | symbol>) {
  const key = path[0];
  return typeof key === 'string' ? fieldLabel[key] ?? key : 'this field';
}

function lengthText(minimum: number) {
  return minimum === 1 ? '1 character' : `${minimum} characters`;
}

export function formatValidationIssues(issues: ZodIssue[]) {
  if (!issues.length) return 'Please check the highlighted fields and try again.';

  const messages = issues.map((issue) => {
    const detail = issue as ZodIssue & {
      origin?: 'string' | 'number' | 'array' | 'date' | 'set' | 'map' | 'object';
      type?: 'string' | 'number' | 'array' | 'date' | 'set' | 'map' | 'object';
      minimum?: number;
      maximum?: number;
      format?: string;
    };
    const label = labelForPath(issue.path);

    switch (issue.code) {
      case 'invalid_type':
        return `Please enter a valid ${label}.`;
      case 'invalid_value':
        return `Please select a valid ${label}.`;
      case 'too_small':
        if (detail.type === 'string' || detail.origin === 'string') {
          return `Please make the ${label} at least ${lengthText(detail.minimum ?? 0)} long.`;
        }
        if (detail.type === 'number' || detail.origin === 'number') {
          return `Please make the ${label} at least ${detail.minimum}.`;
        }
        return `Please provide a valid ${label}.`;
      case 'too_big':
        if (detail.type === 'string' || detail.origin === 'string') {
          return `Please keep the ${label} under ${lengthText(detail.maximum ?? 0)}.`;
        }
        return `Please keep the ${label} within the allowed limit.`;
      case 'invalid_format':
        if (detail.format === 'email') return 'Please enter a valid email address.';
        return `Please enter a valid ${label}.`;
      case 'unrecognized_keys':
        return 'Please remove unsupported fields and try again.';
      default:
        return issue.message || `Please check the ${label} and try again.`;
    }
  });

  return Array.from(new Set(messages)).join(' ');
}
