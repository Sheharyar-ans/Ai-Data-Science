import Papa from 'papaparse';

export function extractDatasetSample(file: File, sampleSize: number = 1500): Promise<string> {
  return new Promise((resolve, reject) => {
    let rows: any[] = [];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      step: (results, parser) => {
        rows.push(results.data);
        if (rows.length >= sampleSize) {
          parser.abort();
          resolve(JSON.stringify(rows, null, 2));
        }
      },
      complete: () => {
        resolve(JSON.stringify(rows, null, 2));
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

export function previewDataset(file: File): Promise<{
    previewRows: any[];
    columns: { name: string; type: string; missing: number }[];
    totalRows: number;
}> {
  return new Promise((resolve, reject) => {
    let rows: any[] = [];
    let columnsMap = new Map<string, { missing: number, types: Set<string> }>();
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      step: (results) => {
        const row = results.data as Record<string, any>;
        rows.push(row);
        
        Object.keys(row).forEach(key => {
            if (!columnsMap.has(key)) {
                columnsMap.set(key, { missing: 0, types: new Set() });
            }
            const val = row[key];
            const stat = columnsMap.get(key)!;
            if (val === null || val === undefined || val === '') {
                stat.missing += 1;
            } else {
                if (!isNaN(Number(val))) stat.types.add('numeric');
                else stat.types.add('string');
            }
        });
      },
      complete: () => {
        let columns = Array.from(columnsMap.entries()).map(([name, stat]) => {
           let type = 'unknown';
           if (stat.types.has('string') && stat.types.has('numeric')) type = 'mixed';
           else if (stat.types.has('numeric')) type = 'numeric';
           else if (stat.types.has('string')) type = 'string';
           return { name, type, missing: stat.missing };
        });
        resolve({
            previewRows: rows.slice(0, 50),
            columns,
            totalRows: rows.length
        });
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}
