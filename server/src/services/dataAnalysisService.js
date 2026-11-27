import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { getGeminiModel, isGeminiConfigured, safeParseJson } from './aiService.js';

/**
 * Robust cell null check
 */
export const isNullOrEmpty = (val) => {
  if (val === null || val === undefined) return true;
  if (typeof val === 'string') {
    const trimmed = val.trim().toLowerCase();
    return trimmed === '' || trimmed === 'null' || trimmed === 'undefined' || trimmed === 'nan' || trimmed === 'n/a';
  }
  if (typeof val === 'number') {
    return Number.isNaN(val);
  }
  return false;
};

/**
 * Infer column data type from sample values
 */
export const inferColumnType = (values) => {
  const nonNulls = values.filter((v) => !isNullOrEmpty(v));
  if (nonNulls.length === 0) return 'string';

  let numericCount = 0;
  let booleanCount = 0;
  let dateCount = 0;

  const dateRegex = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}(?:[T\s]\d{1,2}:\d{2}(?::\d{2})?)?$/;

  nonNulls.forEach((val) => {
    // Number check
    if (typeof val === 'number' && !Number.isNaN(val)) {
      numericCount++;
    } else if (typeof val === 'string' && val.trim() !== '' && !Number.isNaN(Number(val.replace(/,/g, '')))) {
      numericCount++;
    } else if (typeof val === 'boolean' || val === 'true' || val === 'false' || val === 'TRUE' || val === 'FALSE') {
      booleanCount++;
    } else if (val instanceof Date || (typeof val === 'string' && (dateRegex.test(val.trim()) || (!Number.isNaN(Date.parse(val)) && val.length > 5 && isNaN(Number(val)))))) {
      dateCount++;
    }
  });

  const sampleSize = nonNulls.length;
  if (numericCount / sampleSize >= 0.75) return 'numeric';
  if (booleanCount / sampleSize >= 0.75) return 'boolean';
  if (dateCount / sampleSize >= 0.75) return 'date';
  return 'string';
};

/**
 * Parse uploaded file (CSV, XLSX, XLS, JSON) into clean array of row objects
 */
export const parseFileToRows = async (filePath, originalName) => {
  const ext = path.extname(originalName || filePath).toLowerCase();

  if (ext === '.csv' || ext === '.txt') {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: true,
    });

    const rows = (parsed.data || []).filter((r) => r && Object.keys(r).length > 0);
    return rows;
  }

  if (ext === '.xlsx' || ext === '.xls') {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true });
    const firstSheetName = workbook.SheetNames?.[0];
    if (!firstSheetName) {
      throw new Error('Excel workbook contains no sheets.');
    }
    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, {
      defval: null,
      raw: false,
    });
    return rows;
  }

  if (ext === '.json') {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.data)) return parsed.data;
    if (parsed && Array.isArray(parsed.rows)) return parsed.rows;
    throw new Error('JSON file must contain an array of row objects or a "data" array.');
  }

  throw new Error(`Unsupported dataset format (${ext}). Supported: CSV, XLSX, XLS, JSON`);
};

/**
 * Data Profiling & Quality Health Check (SRS Items 3 & 6)
 */
export const profileData = (rows) => {
  if (!rows || rows.length === 0) {
    return {
      rowCount: 0,
      columnCount: 0,
      columns: [],
      summaryStats: { missingCellsCount: 0, totalCellsCount: 0, duplicateRowsCount: 0, qualityScore: 100 },
      chartRecommendations: [],
    };
  }

  // Deduplicate column headers across rows
  const columnNames = Array.from(
    new Set(
      rows.flatMap((r) => (r && typeof r === 'object' ? Object.keys(r) : []))
    )
  ).filter((col) => col && col.trim() !== '');

  const rowCount = rows.length;
  const columnCount = columnNames.length;
  let totalMissingCells = 0;

  // Track row duplication using string hashes
  const seenRowHashes = new Set();
  let duplicateRowsCount = 0;

  rows.forEach((row) => {
    const serialized = JSON.stringify(row);
    if (seenRowHashes.has(serialized)) {
      duplicateRowsCount++;
    } else {
      seenRowHashes.add(serialized);
    }
  });

  // Profile each column
  const columns = columnNames.map((name) => {
    const rawValues = rows.map((r) => r[name]);
    const inferredType = inferColumnType(rawValues);

    let nullCount = 0;
    const nonNullValues = [];

    rawValues.forEach((val) => {
      if (isNullOrEmpty(val)) {
        nullCount++;
      } else {
        nonNullValues.push(val);
      }
    });

    totalMissingCells += nullCount;
    const uniqueCount = new Set(nonNullValues).size;
    const sampleValues = Array.from(new Set(nonNullValues)).slice(0, 5);

    let min = null;
    let max = null;
    let mean = null;
    let median = null;
    let stdDev = null;

    if (inferredType === 'numeric' && nonNullValues.length > 0) {
      const numbers = nonNullValues
        .map((v) => (typeof v === 'number' ? v : Number(String(v).replace(/,/g, ''))))
        .filter((n) => !Number.isNaN(n));

      if (numbers.length > 0) {
        numbers.sort((a, b) => a - b);
        min = numbers[0];
        max = numbers[numbers.length - 1];
        const sum = numbers.reduce((acc, curr) => acc + curr, 0);
        mean = parseFloat((sum / numbers.length).toFixed(2));

        const mid = Math.floor(numbers.length / 2);
        median = numbers.length % 2 !== 0 ? numbers[mid] : parseFloat(((numbers[mid - 1] + numbers[mid]) / 2).toFixed(2));

        const variance = numbers.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0) / numbers.length;
        stdDev = parseFloat(Math.sqrt(variance).toFixed(2));
      }
    }

    return {
      name,
      type: inferredType,
      nullCount,
      uniqueCount,
      min,
      max,
      mean,
      median,
      stdDev,
      sampleValues,
    };
  });

  const totalCells = rowCount * columnCount;
  const missingRatio = totalCells > 0 ? totalMissingCells / totalCells : 0;
  const duplicateRatio = rowCount > 0 ? duplicateRowsCount / rowCount : 0;
  const qualityScore = Math.max(0, Math.min(100, Math.round(100 - missingRatio * 60 - duplicateRatio * 40)));

  // Generate automated smart chart recommendations
  const chartRecommendations = generateChartRecommendations(rows, columns);

  return {
    rowCount,
    columnCount,
    columns,
    summaryStats: {
      missingCellsCount: totalMissingCells,
      totalCellsCount: totalCells,
      duplicateRowsCount,
      qualityScore,
    },
    chartRecommendations,
  };
};

/**
 * Auto-detect Best Chart Representations (SRS Item 1)
 */
export const generateChartRecommendations = (rows, columns) => {
  const recommendations = [];
  const numericCols = columns.filter((c) => c.type === 'numeric');
  const stringCols = columns.filter((c) => c.type === 'string' && c.uniqueCount >= 2 && c.uniqueCount <= 20);
  const dateCols = columns.filter((c) => c.type === 'date');

  // 1. Time Series Trend (Line / Area Chart)
  if (dateCols.length > 0 && numericCols.length > 0) {
    const dateCol = dateCols[0].name;
    const numCol = numericCols[0].name;

    // Aggregate by date (take first 15 points)
    const aggregated = aggregateData(rows, dateCol, numCol, 'sum').slice(0, 15);
    recommendations.push({
      id: 'trend-line-1',
      title: `${numCol} Trend Over Time (${dateCol})`,
      type: 'line',
      xAxis: dateCol,
      yAxis: numCol,
      data: aggregated,
    });

    recommendations.push({
      id: 'trend-area-1',
      title: `Cumulative ${numCol} Volume`,
      type: 'area',
      xAxis: dateCol,
      yAxis: numCol,
      data: aggregated,
    });
  }

  // 2. Categorical Breakdown (Bar / Pie Chart)
  if (stringCols.length > 0 && numericCols.length > 0) {
    const catCol = stringCols[0].name;
    const numCol = numericCols[0].name;

    const aggregated = aggregateData(rows, catCol, numCol, 'sum').slice(0, 10);
    recommendations.push({
      id: 'cat-bar-1',
      title: `${numCol} by ${catCol}`,
      type: 'bar',
      xAxis: catCol,
      yAxis: numCol,
      data: aggregated,
    });

    if (aggregated.length <= 8) {
      recommendations.push({
        id: 'cat-pie-1',
        title: `${catCol} Distribution of ${numCol}`,
        type: 'pie',
        xAxis: catCol,
        yAxis: numCol,
        data: aggregated,
      });
    }
  }

  // 3. Multi-bar Comparison or 2nd Numeric Relationship
  if (stringCols.length > 0 && numericCols.length >= 2) {
    const catCol = stringCols[0].name;
    const num1 = numericCols[0].name;
    const num2 = numericCols[1].name;

    const data = aggregateMultiData(rows, catCol, [num1, num2]).slice(0, 8);
    recommendations.push({
      id: 'multi-bar-1',
      title: `${num1} vs ${num2} across ${catCol}`,
      type: 'bar',
      xAxis: catCol,
      yAxes: [num1, num2],
      data,
    });
  }

  // 4. Default Count Bar Chart if no numeric columns
  if (numericCols.length === 0 && stringCols.length > 0) {
    const catCol = stringCols[0].name;
    const aggregated = aggregateData(rows, catCol, null, 'count').slice(0, 10);
    recommendations.push({
      id: 'cat-count-bar',
      title: `Record Counts by ${catCol}`,
      type: 'bar',
      xAxis: catCol,
      yAxis: 'count',
      data: aggregated,
    });
  }

  return recommendations;
};

/**
 * Aggregation helper for charts
 */
export const aggregateData = (rows, groupCol, valCol, method = 'sum') => {
  const map = new Map();

  rows.forEach((r) => {
    const key = String(r[groupCol] || 'Other');
    const val = valCol ? Number(String(r[valCol] || 0).replace(/,/g, '')) : 1;
    const validVal = Number.isNaN(val) ? 0 : val;

    if (!map.has(key)) {
      map.set(key, { sum: 0, count: 0 });
    }
    const current = map.get(key);
    current.sum += validVal;
    current.count += 1;
  });

  return Array.from(map.entries()).map(([k, v]) => ({
    [groupCol]: k,
    [valCol || 'count']:
      method === 'average'
        ? parseFloat((v.sum / (v.count || 1)).toFixed(2))
        : method === 'count'
        ? v.count
        : parseFloat(v.sum.toFixed(2)),
  }));
};

/**
 * Multi-metric aggregation helper
 */
export const aggregateMultiData = (rows, groupCol, valCols = []) => {
  const map = new Map();

  rows.forEach((r) => {
    const key = String(r[groupCol] || 'Other');
    if (!map.has(key)) {
      const init = { [groupCol]: key };
      valCols.forEach((col) => {
        init[col] = 0;
      });
      map.set(key, init);
    }
    const record = map.get(key);
    valCols.forEach((col) => {
      const num = Number(String(r[col] || 0).replace(/,/g, ''));
      if (!Number.isNaN(num)) {
        record[col] += num;
      }
    });
  });

  return Array.from(map.values()).map((rec) => {
    const formatted = { ...rec };
    valCols.forEach((col) => {
      formatted[col] = parseFloat(formatted[col].toFixed(2));
    });
    return formatted;
  });
};

/**
 * One-Click Auto-Clean Pipeline (SRS Item 3)
 */
export const autoCleanData = (rows, columns, options = {}) => {
  const {
    removeDuplicates = true,
    handleMissingValues = 'mean_median', // 'mean_median' | 'drop' | 'none'
    trimStrings = true,
    normalizeDates = true,
  } = options;

  const beforeStats = profileData(rows).summaryStats;
  let cleaned = [...rows];
  const actionsTaken = [];
  let affectedRowsCount = 0;

  // 1. Remove duplicate rows
  if (removeDuplicates) {
    const seen = new Set();
    const initialCount = cleaned.length;
    cleaned = cleaned.filter((r) => {
      const key = JSON.stringify(r);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const removedDups = initialCount - cleaned.length;
    if (removedDups > 0) {
      affectedRowsCount += removedDups;
      actionsTaken.push(`Removed ${removedDups} exact duplicate rows.`);
    }
  }

  // Pre-calculate column means and modes
  const colMeans = {};
  const colModes = {};

  columns.forEach((c) => {
    if (c.type === 'numeric' && c.mean !== null) {
      colMeans[c.name] = c.median !== null ? c.median : c.mean;
    } else {
      // Find mode
      const counts = {};
      rows.forEach((r) => {
        const val = r[c.name];
        if (!isNullOrEmpty(val)) {
          counts[val] = (counts[val] || 0) + 1;
        }
      });
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      colModes[c.name] = sorted[0]?.[0] || 'Unknown';
    }
  });

  // 2. Missing values imputation / drop
  if (handleMissingValues === 'drop') {
    const initialCount = cleaned.length;
    cleaned = cleaned.filter((r) => {
      return !Object.values(r).some(isNullOrEmpty);
    });
    const dropped = initialCount - cleaned.length;
    if (dropped > 0) {
      affectedRowsCount += dropped;
      actionsTaken.push(`Dropped ${dropped} rows with missing cells.`);
    }
  } else if (handleMissingValues === 'mean_median') {
    let imputedCount = 0;
    cleaned = cleaned.map((row) => {
      const newRow = { ...row };
      columns.forEach((col) => {
        if (isNullOrEmpty(newRow[col.name])) {
          imputedCount++;
          if (col.type === 'numeric') {
            newRow[col.name] = colMeans[col.name] !== undefined ? colMeans[col.name] : 0;
          } else if (col.type === 'date') {
            newRow[col.name] = new Date().toISOString().split('T')[0];
          } else if (col.type === 'boolean') {
            newRow[col.name] = false;
          } else {
            newRow[col.name] = colModes[col.name] || 'Unknown';
          }
        }
      });
      return newRow;
    });
    if (imputedCount > 0) {
      actionsTaken.push(`Imputed ${imputedCount} missing cells using column medians and modes.`);
    }
  }

  // 3. String trimming & Date normalization
  cleaned = cleaned.map((row) => {
    const newRow = { ...row };
    columns.forEach((col) => {
      let val = newRow[col.name];
      if (typeof val === 'string' && trimStrings) {
        val = val.trim().replace(/\s+/g, ' ');
      }
      if (col.type === 'date' && normalizeDates && val) {
        const parsed = Date.parse(val);
        if (!Number.isNaN(parsed)) {
          val = new Date(parsed).toISOString().split('T')[0];
        }
      }
      newRow[col.name] = val;
    });
    return newRow;
  });

  if (trimStrings) {
    actionsTaken.push('Normalized whitespace across text columns.');
  }

  const afterProfile = profileData(cleaned);
  const afterStats = afterProfile.summaryStats;

  return {
    cleanedRows: cleaned,
    updatedColumns: afterProfile.columns,
    beforeStats,
    afterStats,
    affectedRowsCount,
    actionsTaken,
  };
};

/**
 * Helper to reliably parse numeric values from numbers, formatted strings (with commas, currency, spaces)
 * @param {any} val
 * @returns {number|null}
 */
export const parseNumericValue = (val) => {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return Number.isNaN(val) ? null : val;
  if (typeof val === 'string') {
    // Strip currency symbols (₹, $, €, £, ¥), whitespace, commas, percentage
    const cleaned = val.replace(/[₹$€£¥\s,]/g, '').replace(/%$/, '').trim();
    if (cleaned === '') return null;
    const num = Number(cleaned);
    return Number.isNaN(num) ? null : num;
  }
  return null;
};

/**
 * Natural Language Query Engine with Formula Transparency (SRS Item 2)
 * Deterministic JavaScript Calculation with Gemini natural-language presentation
 */
export const askDataQuery = async (rows, columns, question, language = 'en') => {
  const numericCols = columns.filter((c) => c.type === 'numeric');
  const stringCols = columns.filter((c) => c.type === 'string');

  const langNames = {
    en: 'English',
    gu: 'Gujarati (ગુજરાતી)',
    hi: 'Hindi (हिन्दी)',
  };
  const targetLang = langNames[language] || 'English';
  const lowerQ = question.toLowerCase();

  // 1. Identify Operation
  let operation = 'sum';
  if (lowerQ.includes('average') || lowerQ.includes('avg') || lowerQ.includes('mean') || lowerQ.includes('સરેરાશ') || lowerQ.includes('औसत')) {
    operation = 'avg';
  } else if (lowerQ.includes('max') || lowerQ.includes('highest') || lowerQ.includes('maximum') || lowerQ.includes('top') || lowerQ.includes('peak') || lowerQ.includes('greatest') || lowerQ.includes('મહત્તમ') || lowerQ.includes('સૌથી વધુ') || lowerQ.includes('अधिकतम')) {
    operation = 'max';
  } else if (lowerQ.includes('min') || lowerQ.includes('lowest') || lowerQ.includes('minimum') || lowerQ.includes('bottom') || lowerQ.includes('least') || lowerQ.includes('smallest') || lowerQ.includes('ન્યૂનતમ') || lowerQ.includes('સૌથી ઓછું') || lowerQ.includes('न्यूनतम')) {
    operation = 'min';
  } else if (lowerQ.includes('how many') || lowerQ.includes('count') || lowerQ.includes('number of') || lowerQ.includes('કેટલા') || lowerQ.includes('કેટલી') || lowerQ.includes('कितने') || lowerQ.includes('गिनती')) {
    operation = 'count';
  } else if (lowerQ.includes('total') || lowerQ.includes('sum') || lowerQ.includes('overall') || lowerQ.includes('કુલ') || lowerQ.includes('कुल') || lowerQ.includes('સરવાળો') || lowerQ.includes('योग')) {
    operation = 'sum';
  }

  // 2. Target Column Matching
  let targetCol = numericCols.find((c) => {
    const colLower = c.name.toLowerCase();
    const cleanCol = colLower.replace(/[_\s]/g, '');
    const cleanQ = lowerQ.replace(/[_\s]/g, '');
    return cleanQ.includes(cleanCol) || lowerQ.includes(colLower);
  });

  if (!targetCol) {
    if (lowerQ.includes('sale') || lowerQ.includes('revenue') || lowerQ.includes('turnover') || lowerQ.includes('amount') || lowerQ.includes('વેચાણ') || lowerQ.includes('બિક્રી') || lowerQ.includes('बिक्री')) {
      targetCol = numericCols.find((c) => /sale|rev|amount|turnover|income/i.test(c.name));
    } else if (lowerQ.includes('quantity') || lowerQ.includes('qty') || lowerQ.includes('unit') || lowerQ.includes('volume') || lowerQ.includes('જથ્થો') || lowerQ.includes('मात्रा')) {
      targetCol = numericCols.find((c) => /quant|qty|unit|vol/i.test(c.name));
    } else if (lowerQ.includes('price') || lowerQ.includes('cost') || lowerQ.includes('rate') || lowerQ.includes('ખર્ચ') || lowerQ.includes('કિંમત') || lowerQ.includes('मूल्य')) {
      targetCol = numericCols.find((c) => /price|cost|rate/i.test(c.name));
    } else if (lowerQ.includes('profit') || lowerQ.includes('margin') || lowerQ.includes('નફો') || lowerQ.includes('लाभ')) {
      targetCol = numericCols.find((c) => /profit|margin/i.test(c.name));
    }
  }

  if (!targetCol && numericCols.length > 0) {
    targetCol = numericCols[0];
  }

  // 3. Optional Filter Matching (e.g., specific City or Category mentioned in question)
  let activeFilter = null;
  let filteredRows = rows;
  for (const sCol of stringCols) {
    const distinctVals = [...new Set(rows.map((r) => r[sCol.name]).filter(Boolean))];
    for (const dVal of distinctVals) {
      const dValStr = String(dVal).toLowerCase().trim();
      if (dValStr.length >= 3 && lowerQ.includes(dValStr)) {
        activeFilter = { column: sCol.name, value: dVal };
        filteredRows = rows.filter((r) => String(r[sCol.name]).toLowerCase().trim() === dValStr);
        break;
      }
    }
    if (activeFilter) break;
  }

  // 4. Deterministic Calculation across ALL records
  let rawResult = 0;
  let validCount = 0;
  const colName = targetCol ? targetCol.name : 'Records';

  if (targetCol && operation !== 'count') {
    const values = [];
    filteredRows.forEach((r) => {
      const num = parseNumericValue(r[targetCol.name]);
      if (num !== null) {
        values.push(num);
      }
    });

    validCount = values.length;

    if (operation === 'sum') {
      rawResult = values.reduce((acc, curr) => acc + curr, 0);
    } else if (operation === 'avg') {
      const sum = values.reduce((acc, curr) => acc + curr, 0);
      rawResult = values.length > 0 ? parseFloat((sum / values.length).toFixed(2)) : 0;
    } else if (operation === 'max') {
      rawResult = values.length > 0 ? Math.max(...values) : 0;
    } else if (operation === 'min') {
      rawResult = values.length > 0 ? Math.min(...values) : 0;
    }
  } else {
    operation = 'count';
    rawResult = filteredRows.length;
    validCount = filteredRows.length;
  }

  // Formatting result
  const isCurrency = targetCol && /sale|price|cost|revenue|profit|turnover|amount|salary|wage/i.test(targetCol.name);
  const formattedNumber = rawResult.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  const displayVal = (isCurrency && operation !== 'count') ? `₹${formattedNumber}` : formattedNumber;

  // Formula & Query Transparency
  const filterPart = activeFilter ? ` WHERE ${activeFilter.column} == '${activeFilter.value}'` : '';
  const calculationFormula = `${operation.toUpperCase()}(${colName})${filterPart} = ${displayVal} [Formula: ${operation.toUpperCase()}(${colName}) | Records Processed: ${validCount}/${rows.length} | Column: "${colName}" (numeric)]`;

  // Deterministic Default Text
  let deterministicAnswer = '';
  const filterDesc = activeFilter ? ` for ${activeFilter.column} "${activeFilter.value}"` : '';
  const filterDescGu = activeFilter ? ` (${activeFilter.column} "${activeFilter.value}" માટે)` : '';
  const filterDescHi = activeFilter ? ` (${activeFilter.column} "${activeFilter.value}" के लिए)` : '';

  if (operation === 'sum') {
    if (language === 'gu') {
      deterministicAnswer = `તમામ ${validCount} પ્રોસેસ કરેલા રેકોર્ડ્સ પર ${colName} નો કુલ સરવાળો ${displayVal} છે${filterDescGu} (કુલ ${rows.length} પંક્તિઓમાંથી).`;
    } else if (language === 'hi') {
      deterministicAnswer = `सभी ${validCount} संसाधित रिकॉर्ड में ${colName} का कुल योग ${displayVal} है${filterDescHi} (कुल ${rows.length} पंक्तियों में से)।`;
    } else {
      deterministicAnswer = `The total ${colName} across all ${validCount} processed records is ${displayVal}${filterDesc} (out of ${rows.length} total rows).`;
    }
  } else if (operation === 'avg') {
    if (language === 'gu') {
      deterministicAnswer = `તમામ ${validCount} પ્રોસેસ કરેલા રેકોર્ડ્સ પર ${colName} ની સરેરાશ કિંમત ${displayVal} છે${filterDescGu}.`;
    } else if (language === 'hi') {
      deterministicAnswer = `सभी ${validCount} संसाधित रिकॉर्ड में ${colName} का औसत मान ${displayVal} है${filterDescHi}।`;
    } else {
      deterministicAnswer = `The average ${colName} across all ${validCount} processed records is ${displayVal}${filterDesc}.`;
    }
  } else if (operation === 'max') {
    if (language === 'gu') {
      deterministicAnswer = `ડેટાસેટમાં મહત્તમ ${colName} ${displayVal} છે${filterDescGu}.`;
    } else if (language === 'hi') {
      deterministicAnswer = `डेटासेट में अधिकतम ${colName} ${displayVal} है${filterDescHi}।`;
    } else {
      deterministicAnswer = `The maximum ${colName} in the dataset is ${displayVal}${filterDesc}.`;
    }
  } else if (operation === 'min') {
    if (language === 'gu') {
      deterministicAnswer = `ડેટાસેટમાં લઘુત્તમ ${colName} ${displayVal} છે${filterDescGu}.`;
    } else if (language === 'hi') {
      deterministicAnswer = `डेटासेट में न्यूनतम ${colName} ${displayVal} है${filterDescHi}।`;
    } else {
      deterministicAnswer = `The minimum ${colName} in the dataset is ${displayVal}${filterDesc}.`;
    }
  } else {
    if (language === 'gu') {
      deterministicAnswer = `આ ડેટાસેટમાં કુલ ${validCount} રેકોર્ડ્સ${filterDescGu} અને ${columns.length} કૉલમ છે.`;
    } else if (language === 'hi') {
      deterministicAnswer = `इस डेटासेट में कुल ${validCount} रिकॉर्ड${filterDescHi} और ${columns.length} कॉलम हैं।`;
    } else {
      deterministicAnswer = `The dataset contains a total of ${validCount} records${filterDesc} across ${columns.length} columns.`;
    }
  }

  // Recommended Chart
  let chartRecommendation = null;
  if (stringCols.length > 0 && targetCol) {
    const groupColObj = stringCols.find((c) => !/id$|_id|^id/i.test(c.name)) || stringCols[0];
    const groupCol = groupColObj.name;
    const chartData = aggregateData(filteredRows, groupCol, targetCol.name, operation === 'avg' ? 'average' : 'sum').slice(0, 10);
    chartRecommendation = {
      title: `${targetCol.name} by ${groupCol} (${operation.toUpperCase()})`,
      type: 'bar',
      xAxis: groupCol,
      yAxis: targetCol.name,
      data: chartData,
    };
  }

  // 5. Send pre-calculated number to Gemini for natural-language synthesis
  const model = getGeminiModel({
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  });

  if (!model) {
    return {
      answer: deterministicAnswer,
      calculationFormula,
      chartRecommendation,
    };
  }

  try {
    const prompt = `You are DataInsight's Natural Language Business Intelligence & Formula Transparency Engine.
The exact calculation has ALREADY BEEN DETERMINISTICALLY COMPUTED using JavaScript:
- Metric / Operation: ${operation.toUpperCase()} of "${colName}"
- Exact Calculated Value: ${displayVal} (Raw: ${rawResult})
- Records Processed: ${validCount} out of ${rows.length} total rows
- Applied Filter: ${activeFilter ? `${activeFilter.column} == '${activeFilter.value}'` : 'None (All rows)'}
- Transparency Formula: ${calculationFormula}
- Requested Language: ${targetLang}

User's Question:
"${question}"

YOUR TASK:
Write a professional, student/business-friendly natural-language answer explaining this exact result to the user in ${targetLang}.

CRITICAL REQUIREMENTS:
1. You MUST include the exact calculated number ${displayVal}.
2. Do NOT recalculate or invent any different number.
3. State clearly that this calculation is based on all ${validCount} records.

Return strictly a JSON object:
{
  "answer": "Professional explanation incorporating ${displayVal} in ${targetLang}..."
}
`;

    const result = await model.generateContent(prompt);
    const parsed = safeParseJson(result.response.text(), null);

    let answer = deterministicAnswer;
    if (parsed && parsed.answer) {
      answer = parsed.answer;
      // Safeguard: Ensure the calculated number appears in the final text
      if (!answer.includes(formattedNumber) && !answer.includes(String(rawResult))) {
        answer = `${answer} (Calculated Result: ${displayVal})`;
      }
    }

    return {
      answer,
      calculationFormula,
      chartRecommendation,
    };
  } catch (err) {
    console.error('[dataAnalysisService] Gemini synthesis error, using deterministic answer:', err.message);
    return {
      answer: deterministicAnswer,
      calculationFormula,
      chartRecommendation,
    };
  }
};

/**
 * Outlier & Anomaly Detection (SRS Item 4)
 * Flags data points with |Z-score| > 2.5
 */
export const detectAnomalies = (rows, columnName) => {
  const validNumbers = [];

  rows.forEach((r, idx) => {
    const val = Number(r[columnName]);
    if (!Number.isNaN(val) && val !== null) {
      validNumbers.push({ index: idx, value: val, row: r });
    }
  });

  if (validNumbers.length < 5) {
    return { columnName, mean: 0, stdDev: 0, outliers: [] };
  }

  const sum = validNumbers.reduce((acc, curr) => acc + curr.value, 0);
  const mean = sum / validNumbers.length;
  const variance = validNumbers.reduce((acc, curr) => acc + Math.pow(curr.value - mean, 2), 0) / validNumbers.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) {
    return { columnName, mean, stdDev, outliers: [] };
  }

  const outliers = [];
  validNumbers.forEach((item) => {
    const zScore = Math.abs(item.value - mean) / stdDev;
    if (zScore > 2.5) {
      outliers.push({
        rowIndex: item.index + 1,
        value: item.value,
        zScore: parseFloat(zScore.toFixed(2)),
        direction: item.value > mean ? 'spike' : 'drop',
        rowData: item.row,
      });
    }
  });

  return {
    columnName,
    mean: parseFloat(mean.toFixed(2)),
    stdDev: parseFloat(stdDev.toFixed(2)),
    threshold: 2.5,
    outliersCount: outliers.length,
    outliers,
  };
};

/**
 * Generate AI Insight Executive Report in EN, GU, or HI (SRS Item 5)
 */
export const generateDataReport = async (dataset, language = 'en') => {
  const { rowCount, columnCount, columns, summaryStats, originalName } = dataset;

  const isGu = language === 'gu';
  const isHi = language === 'hi';

  const numCols = (columns || []).filter((c) => c.type === 'numeric');
  const catCols = (columns || []).filter((c) => c.type === 'string');

  // Fallback template report
  const buildFallbackReport = () => {
    if (isGu) {
      return `# 📊 કારોબારી ડેટા ઇનસાઇટ્સ અહેવાલ: ${originalName}

## 📌 ડેટાસેટનું સંક્ષિપ્ત વિહંગાવલોકન
- **કુલ પંક્તિઓ (Rows):** ${rowCount}
- **કુલ કૉલમ્સ (Columns):** ${columnCount}
- **ડેટા ગુણવત્તા સ્કોર (Data Health):** ${summaryStats?.qualityScore || 95}%
- **ખૂટતી કોષોની સંખ્યા (Missing Cells):** ${summaryStats?.missingCellsCount || 0}
- **ડુપ્લિકેટ રેકોર્ડ્સ (Duplicate Rows):** ${summaryStats?.duplicateRowsCount || 0}

## 🔑 મુખ્ય પરિમાણો અને શ્રેષ્ઠ તારણો
${numCols.map((c) => `- **${c.name}:** સરેરાશ = ${c.mean}, ન્યૂનતમ = ${c.min}, મહત્તમ = ${c.max}`).join('\n') || '- વિશ્લેષણ માટે કોઈ સંખ્યાત્મક કૉલમ્સ નથી.'}

## ⚡ મહત્વના વ્યવસાયિક તારણો અને ભલામણો
1. ડેટાસેટમાં રહેલા મુખ્ય વલણો દર્શાવે છે કે સ્થિર પ્રદર્શન જળવાઈ રહ્યું છે.
2. ગુણવત્તા સ્કોર ${summaryStats?.qualityScore || 95}% દર્શાવે છે કે ડેટા વિશ્લેષણ માટે યોગ્ય છે.
3. વ્યવહારિક નિર્ણયો લેવા માટે વિગતવાર ચાર્ટ્સ અને પરિણામો તપાસો.
`;
    }

    if (isHi) {
      return `# 📊 कार्यकारी डेटा विश्लेषण रिपोर्ट: ${originalName}

## 📌 डेटासेट का संक्षिप्त अवलोकन
- **कुल पंक्तियाँ (Rows):** ${rowCount}
- **कुल कॉलम (Columns):** ${columnCount}
- **डेटा स्वास्थ्य स्कोर (Quality Score):** ${summaryStats?.qualityScore || 95}%
- **अनुपलब्ध मान (Missing Cells):** ${summaryStats?.missingCellsCount || 0}
- **डुप्लिकेट पंक्तियाँ (Duplicates):** ${summaryStats?.duplicateRowsCount || 0}

## 🔑 प्रमुख संकेतक और सांख्यिकीय विश्लेषण
${numCols.map((c) => `- **${c.name}:** औसत = ${c.mean}, न्यूनतम = ${c.min}, अधिकतम = ${c.max}`).join('\n') || '- विश्लेषण के लिए कोई संख्यात्मक कॉलम उपलब्ध नहीं हैं।'}

## ⚡ रणनीतिक निष्कर्ष एवं सिफारिशें
1. डेटासेट व्यावसायिक प्रदर्शन में स्थिरता और सतत प्रगति को दर्शाता है।
2. उच्च गुणवत्ता सूचकांक (${summaryStats?.qualityScore || 95}%) निर्णय लेने में विश्वसनीयता सुनिश्चित करता है।
3. आगामी अवधि के लिए स्वचालित चार्ट्स और विसंगतियों की निरंतर निगरानी करें।
`;
    }

    return `# 📊 Executive Data Intelligence Report: ${originalName}

## 📌 Dataset Dimensions & Data Health
- **Total Records (Rows):** ${rowCount.toLocaleString()}
- **Dimensions (Columns):** ${columnCount}
- **Overall Data Quality Score:** ${summaryStats?.qualityScore || 100}%
- **Missing / Null Cells:** ${summaryStats?.missingCellsCount || 0}
- **Duplicate Rows:** ${summaryStats?.duplicateRowsCount || 0}

## 🔑 Key Statistical Benchmarks
${numCols.map((c) => `- **${c.name}:** Mean = ${c.mean}, Min = ${c.min}, Max = ${c.max}, StdDev = ${c.stdDev}`).join('\n') || '- No numeric metrics found.'}

## ⚡ Strategic AI Takeaways & Executive Summary
1. **Data Integrity Baseline:** The dataset achieves an overall health score of **${summaryStats?.qualityScore || 100}%**, indicating robust readiness for production decision-making.
2. **Key Metric Performance:** Metrics across numeric columns show healthy distribution with identifiable highs and lows for strategic focus.
3. **Operational Recommendations:** Continuous monitoring of outliers and automated column imputations will maintain clean reporting pipelines.
`;
  };

  const model = getGeminiModel({ generationConfig: { temperature: 0.2 } });
  if (!model) {
    return buildFallbackReport();
  }

  try {
    const langNames = { en: 'English', gu: 'Gujarati (ગુજરાતી)', hi: 'Hindi (हिन्दी)' };
    const targetLang = langNames[language] || 'English';

    const prompt = `You are a Principal BI Architect and Data Analyst.
Generate an executive data intelligence report from the following dataset profile in ${targetLang}.

Dataset: ${originalName}
Rows: ${rowCount}, Columns: ${columnCount}
Data Quality Score: ${summaryStats?.qualityScore || 100}%
Missing Cells: ${summaryStats?.missingCellsCount || 0}
Duplicate Rows: ${summaryStats?.duplicateRowsCount || 0}

Column Summary:
${columns.map((c) => `- ${c.name} (${c.type}): nulls=${c.nullCount}, unique=${c.uniqueCount}${c.type === 'numeric' ? `, mean=${c.mean}, min=${c.min}, max=${c.max}` : ''}`).join('\n')}

Format your output in clean Markdown with:
# 📊 Executive Data Intelligence Report: ${originalName}
## 📌 Dataset Dimensions & Health Overview
## 🔑 Key Trends & Statistical Highlights
## ⚡ Outlier Anomalies & Future Forecasting
## 💡 Actionable Business Recommendations
`;

    const result = await model.generateContent(prompt);
    const markdown = result.response.text();
    return markdown || buildFallbackReport();
  } catch (err) {
    console.error('[dataAnalysisService] generateDataReport error:', err.message);
    return buildFallbackReport();
  }
};

export default {
  parseFileToRows,
  profileData,
  autoCleanData,
  askDataQuery,
  detectAnomalies,
  generateDataReport,
  generateChartRecommendations,
  aggregateData,
};
