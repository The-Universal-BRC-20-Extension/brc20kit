# FAQ Page Documentation

This directory contains the Frequently Asked Questions (FAQ) page for the BRC-20 Kit application.

## Files

- **`page.tsx`** - Main FAQ page component
- **`faq-data.ts`** - Centralized FAQ content (questions and answers)
- **`loading.tsx`** - Loading state component
- **`README.md`** - This file

## Modifying FAQ Content

To add, remove, or modify FAQ questions, **edit the `faq-data.ts` file only**. No code changes are needed!

### Adding a New Question

1. Open `faq-data.ts`
2. Find the appropriate category in the `faqItems` array
3. Add a new object:

```typescript
{
  category: "category-id",  // e.g., "getting-started", "configuration"
  question: "Your question here?",
  answer: "Your answer here. It can be a long multi-line answer with details.",
}
```

### Adding a New Category

1. Open `faq-data.ts`
2. Add a new category to the `faqCategories` array:

```typescript
{
  id: "your-category-id",
  title: "Category Title",
  description: "Optional description",
}
```

3. Then add FAQ items with `category: "your-category-id"`

### Modifying an Existing Question

1. Open `faq-data.ts`
2. Find the question in the `faqItems` array
3. Edit the `question` or `answer` field
4. Save the file

## Categories

Current categories:
- **getting-started** - Basic setup and configuration questions
- **configuration** - Environment variables and customization
- **wallet-support** - Questions about wallet integration
- **minting** - How minting works and chained transactions
- **fees** - Platform fees, network fees, and pricing
- **troubleshooting** - Common issues and solutions
- **technical** - Advanced technical questions
- **deployment** - Hosting and deployment questions
- **security** - Security features and best practices
- **support** - Getting help and reporting issues

## Features

- **Search functionality** - Users can search across all FAQs
- **Category filtering** - FAQs organized by topic
- **Accordion UI** - Expandable question/answer format
- **Table of Contents** - Quick navigation on desktop
- **Responsive design** - Works on mobile, tablet, and desktop
- **Easy to modify** - All content in one centralized file

## Page Structure

The FAQ page is accessible at `/faq` and includes:

1. **Hero section** with search bar
2. **Quick stats** showing total questions and categories
3. **Search results** (when searching)
4. **Category sections** with expandable FAQs
5. **Help section** with links to documentation

## Styling

The FAQ page uses the same design system as the rest of the application:
- Components from `@/components/ui`
- Documentation components from `@/components/docs`
- Consistent spacing, typography, and colors
- Dark mode support

## Notes

- All FAQ content is in `faq-data.ts` - no need to modify React components
- Questions can have string answers or React components (for rich formatting)
- Categories are automatically rendered based on the data file
- Search works across questions and answers
