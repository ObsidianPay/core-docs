import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  apiSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting started',
      collapsed: false,
      items: ['authentication', 'conventions', 'step-up'],
    },
    {
      type: 'category',
      label: 'Transactions',
      collapsed: false,
      items: [
        'transactions/overview',
        'transactions/deposits',
        'transactions/transfers',
        'transactions/purchases',
        'transactions/withdrawals',
        'transactions/reading',
      ],
    },
    {
      type: 'category',
      label: 'Products',
      items: ['cards', 'disputes', 'merchant-terminals'],
    },
    {
      type: 'category',
      label: 'Accounts',
      items: ['users', 'security', 'health'],
    },
    {
      type: 'category',
      label: 'Reference',
      items: ['reference/errors', 'reference/enums', 'reference/changelog'],
    },
  ],
};

export default sidebars;
