export enum LineItemCode {
  REGULAR_ITEM = 'regularItem',
  BUNDLE = 'bundle',
  BUNDLE_ITEM = 'bundleItem',
  CUSTOM_BUNDLE = 'customBundle',
  CUSTOM_BUNDLE_ITEM = 'customBundleItem',
  CUSTOM_BUNDLE_TEMPLATE = 'customBundleTemplate',
  CUSTOM_BUNDLE_TEMPLATE_ITEM = 'customBundleTemplateItem',
}

export const LINE_ITEM_TYPE_DESCRIPTIONS: Record<LineItemCode, string> = {
  [LineItemCode.REGULAR_ITEM]: 'Standard line item',
  [LineItemCode.BUNDLE]: 'Bundle container item',
  [LineItemCode.BUNDLE_ITEM]: 'Bundle member item',
  [LineItemCode.CUSTOM_BUNDLE]: 'Custom bundle container item',
  [LineItemCode.CUSTOM_BUNDLE_ITEM]: 'Custom bundle member item',
  [LineItemCode.CUSTOM_BUNDLE_TEMPLATE]: 'Custom bundle template',
  [LineItemCode.CUSTOM_BUNDLE_TEMPLATE_ITEM]: 'Custom bundle template member',
};
