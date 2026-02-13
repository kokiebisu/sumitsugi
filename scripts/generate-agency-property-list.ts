#!/usr/bin/env bun

/**
 * Generate Area-Filtered Property List for Real Estate Agencies
 *
 * Usage:
 *   bun scripts/generate-agency-property-list.ts <area>
 *   bun scripts/generate-agency-property-list.ts --all
 *
 * Examples:
 *   bun scripts/generate-agency-property-list.ts 中目黒
 *   bun scripts/generate-agency-property-list.ts --all
 *
 * Output:
 *   CSV format to stdout (can be saved to file or copied to spreadsheet)
 */

import { properties } from '../src/lib/data';
import {
  generateAgencyPropertyListData,
  getAllAreas,
  type AgencyPropertyInfo,
} from '../src/lib/agency-property-list';

function formatAsCSV(data: AgencyPropertyInfo[]): string {
  const headers = [
    '物件名',
    'エリア',
    '間取り',
    '家具一覧',
    '引越し費用',
    '入居可能日',
    '即入居可能',
  ];

  const rows = data.map((item) => [
    item.propertyName,
    item.area,
    item.layout,
    item.furnitureList,
    item.handoverFee.toLocaleString('ja-JP'),
    item.moveInAvailableFrom,
    item.isImmediatelyAvailable ? '✓ 即入居可能' : '',
  ]);

  const csvLines = [headers, ...rows].map((row) =>
    row.map((cell) => `"${cell}"`).join(',')
  );

  return csvLines.join('\n');
}

function printPropertyList(area: string): void {
  const data = generateAgencyPropertyListData(properties, area);

  if (data.length === 0) {
    console.error(`⚠️  エリア「${area}」に公開中の物件はありません`);
    return;
  }

  console.log(`\n# ${area}エリアの物件リスト（全${data.length}件）\n`);
  console.log(formatAsCSV(data));
  console.log();
}

function printAllAreas(): void {
  const areas = getAllAreas(properties);

  if (areas.length === 0) {
    console.error('⚠️  公開中の物件がありません');
    process.exit(1);
  }

  console.log(`\n# 全エリアの物件リスト\n`);
  console.log(`利用可能なエリア: ${areas.join('、')}\n`);

  for (const area of areas) {
    printPropertyList(area);
  }
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: bun scripts/generate-agency-property-list.ts <area>');
    console.error('       bun scripts/generate-agency-property-list.ts --all');
    console.error('');
    console.error('Available areas:');
    const areas = getAllAreas(properties);
    areas.forEach((area) => console.error(`  - ${area}`));
    process.exit(1);
  }

  const targetArea = args[0];

  if (targetArea === '--all') {
    printAllAreas();
  } else {
    printPropertyList(targetArea);
  }
}

main();
