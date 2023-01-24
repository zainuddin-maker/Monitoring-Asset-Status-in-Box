import XLSX from "xlsx";

export const exportCSVFile = (data, fileTitle) => {
    // [
    //     {
    //         sheetName: "sheet1",
    //         header: ["a", "b"],
    //         body: [
    //             { a: "1", b: "1" },
    //             { a: "2", b: "2" },
    //             { a: "3", b: "3" },
    //         ],
    //     },
    //     {
    //         sheetName: "sheet2",
    //         header: ["c", "d"],
    //         body: [
    //             { c: "4", d: "4" },
    //             { c: "5", d: "5" },
    //             { c: "6", d: "6" },
    //         ],
    //     },
    //     {
    //         sheetName: "sheet3",
    //         header: ["e", "f"],
    //         body: [],
    //     },
    // ];

    const wb = XLSX.utils.book_new(); // book
    data.forEach((el) => {
        const newBody =
            el.body.length > 0
                ? el.body.map((raw) =>
                      el.header.reduce(
                          (obj, key) => ({ ...obj, [key]: raw[key] }),
                          {}
                      )
                  )
                : [];
        const ws = XLSX.utils.json_to_sheet(newBody, {
            header: el.header,
        });
        XLSX.utils.book_append_sheet(wb, ws, el.sheetName);
    });

    return XLSX.writeFile(wb, fileTitle + ".xlsx");
};

// export const exportCSVFile = (headers, items, fileTitle) => {
//     if (headers) {
//         items.unshift(headers);
//     }

//     // Convert Object to JSON
//     let jsonObject = JSON.stringify(items);

//     let csv = convertToCSV(jsonObject);

//     let exportedFilenmae = fileTitle + ".csv" || "export.csv";

//     let blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     if (navigator.msSaveBlob) {
//         // IE 10+
//         navigator.msSaveBlob(blob, exportedFilenmae);
//     } else {
//         let link = document.createElement("a");
//         if (link.download !== undefined) {
//             // feature detection
//             // Browsers that support HTML5 download attribute
//             let url = URL.createObjectURL(blob);
//             link.setAttribute("href", url);
//             link.setAttribute("download", exportedFilenmae);
//             link.style.visibility = "hidden";
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);
//         }
//     }
//     return;
// };
// const convertToCSV = (objArray) => {
//     let array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
//     let str = "";

//     for (let i = 0; i < array.length; i++) {
//         let line = "";
//         for (let index in array[i]) {
//             if (line != "") line += ",";

//             line += array[i][index];
//         }

//         str += line + "\r\n";
//     }

//     return str;
// };

// USAGE SHOULD NOT CONTAIN ','
// let headers = {
//     model: 'Phone Model'.replace(/,/g, ''), // remove commas to avoid errors
//     chargers: "Chargers",
//     cases: "Cases",
//     earphones: "Earphones"
// };

// let itemsFormatted = [
//     {
//         model: 'Samsung S7',
//         chargers: '55',
//         cases: '56',
//         earphones: '57',
//         scratched: '2'
//     },
// ];

// let fileTitle = 'orders'; // or 'my-unique-title'

// exportCSVFile(headers, itemsFormatted, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download
