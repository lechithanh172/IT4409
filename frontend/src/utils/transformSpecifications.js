// Ví dụ: src/utils/transformers.js

/**
 * Chuyển đổi dữ liệu specifications (có thể là chuỗi JSON hoặc mảng)
 * thành cấu trúc có nhóm và tóm tắt.
 * @param {string | Array<object>} inputSpecs - Dữ liệu specs đầu vào, có thể là chuỗi JSON hoặc mảng các object.
 * @returns {object | null} Object chứa { full: Array<{ group: string, items: Array<{ label: string, value: string }> }>, summary: Array<{ label: string, value: string }> } hoặc null nếu input không hợp lệ.
 */
export const transformSpecifications = (inputSpecs) => {
  let flatSpecs;

  // --- Bước 1: Xử lý đầu vào ---
  if (!inputSpecs) {
    console.warn("Input specifications is null or undefined.");
    return null;
  }

  // Kiểm tra nếu input là chuỗi JSON, thì parse nó
  if (typeof inputSpecs === 'string') {
    try {
      flatSpecs = JSON.parse(inputSpecs);
      console.log("Parsed specifications from JSON string:", flatSpecs);
    } catch (error) {
      console.error("Error parsing specifications JSON string:", error, "Input string:", inputSpecs);
      return null; // Trả về null nếu chuỗi JSON không hợp lệ
    }
  } else if (Array.isArray(inputSpecs)) {
    // Nếu đã là mảng thì sử dụng trực tiếp
    flatSpecs = inputSpecs;
    console.log("Using specifications directly as array:", flatSpecs);
  } else {
    // Nếu không phải chuỗi hoặc mảng, báo lỗi
    console.warn("Invalid input type for specifications. Expected string or array, received:", typeof inputSpecs);
    return null;
  }

  // Kiểm tra lại sau khi parse hoặc gán trực tiếp, phải là một mảng hợp lệ
  if (!Array.isArray(flatSpecs) || flatSpecs.length === 0) {
    console.warn("Transformed specifications is not a valid non-empty array.");
    return null;
  }

  // --- Bước 2: Nhóm các thông số kỹ thuật (Logic giữ nguyên) ---
  const groupedSpecs = flatSpecs.reduce((acc, currentSpec) => {
    // Kiểm tra kỹ hơn các thuộc tính của currentSpec
    if (typeof currentSpec !== 'object' || currentSpec === null ||
        !currentSpec.group || typeof currentSpec.group !== 'string' ||
        !currentSpec.title || typeof currentSpec.title !== 'string' ||
        currentSpec.content === undefined || currentSpec.content === null) {
      console.warn("Bỏ qua spec không hợp lệ hoặc thiếu trường:", currentSpec);
      return acc; // Bỏ qua nếu cấu trúc không đúng
    }

    const groupName = currentSpec.group.trim(); // Trim để loại bỏ khoảng trắng thừa
    const label = currentSpec.title.trim();
    const value = currentSpec.content; // Giữ nguyên kiểu dữ liệu ban đầu nếu có thể

    // Chỉ thêm nếu group và title có nội dung
    if (!groupName || !label) {
        console.warn("Bỏ qua spec có group hoặc title rỗng:", currentSpec);
        return acc;
    }


    let group = acc.find(g => g.group === groupName);
    if (!group) {
      group = { group: groupName, items: [] };
      acc.push(group);
    }

    group.items.push({ label: label, value: String(value) }); // Chuyển value thành String ở đây để nhất quán
    return acc;
  }, []);

   // Nếu sau khi reduce không có nhóm nào hợp lệ
   if (groupedSpecs.length === 0) {
      console.warn("No valid specifications groups were created.");
      return { full: [], summary: [] }; // Trả về cấu trúc rỗng
   }


  // --- Bước 3: Tạo tóm tắt (summary) tự động (Logic giữ nguyên) ---
  const summary = [];

  // Định nghĩa các key quan trọng - có thể cấu hình dễ dàng
  const importantSpecs = [
    { priority: 1, keywords: ["màn hình", "display", "screen", "kích thước"] },
    { priority: 2, keywords: ["chip", "cpu", "xử lý", "processor", "vi xử lý"] },
    { priority: 3, keywords: ["ram", "memory"] },
    { priority: 4, keywords: ["bộ nhớ", "rom", "storage", "lưu trữ", "dung lượng"] }, // Gộp bộ nhớ
    { priority: 5, keywords: ["pin", "battery", "dung lượng pin"] },
    { priority: 6, keywords: ["camera sau", "camera chính", "rear camera"] },
    { priority: 7, keywords: ["camera trước", "camera selfie", "front camera"] },
    { priority: 8, keywords: ["os", "hệ điều hành"] }
    // Thêm các ưu tiên khác nếu cần
  ];

  // Hàm kiểm tra nếu một chuỗi chứa từ khóa (không phân biệt hoa thường)
  const containsKeyword = (text, keywords) => {
    if (typeof text !== 'string') return false;
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
  };

  // Set để theo dõi các priority đã được thêm vào summary
  const addedPriorities = new Set();

  // Tìm thông số quan trọng từ mỗi nhóm
  groupedSpecs.forEach(group => {
    const groupName = group.group; // Giữ nguyên case gốc để hiển thị nếu cần

    // Ưu tiên tìm trong các items trước
    for (const item of group.items) {
       for (const spec of importantSpecs) {
           // Nếu item này khớp với từ khóa và priority này chưa được thêm
           if (!addedPriorities.has(spec.priority) && containsKeyword(item.label, spec.keywords)) {
                summary.push({
                    label: item.label, // Lấy label cụ thể
                    value: item.value,
                    priority: spec.priority
                });
                addedPriorities.add(spec.priority); // Đánh dấu đã thêm
                break; // Chuyển sang spec ưu tiên tiếp theo
           }
       }
    }

     // Nếu không tìm thấy trong items, thử kiểm tra tên nhóm
     for (const spec of importantSpecs) {
         // Nếu tên nhóm khớp, priority chưa thêm, và nhóm có item
         if (!addedPriorities.has(spec.priority) && containsKeyword(groupName, spec.keywords) && group.items.length > 0) {
              // Lấy item đầu tiên làm đại diện cho nhóm
              summary.push({
                 label: groupName, // Lấy tên nhóm làm label
                 value: group.items[0].value,
                 priority: spec.priority
              });
              addedPriorities.add(spec.priority);
              break;
         }
     }
  });

  // Sắp xếp summary theo thứ tự ưu tiên và loại bỏ trường priority
  const sortedSummary = summary
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 6) // Giới hạn số lượng summary hiển thị (ví dụ: 6)
    .map(({ label, value }) => ({ label, value }));

  // --- Bước 4: Trả về kết quả ---
  return { full: groupedSpecs, summary: sortedSummary };
};

// --- Ví dụ sử dụng ---
// const jsonStringInput = "[{\"group\":\"Màn hình\",\"title\":\"Kích thước\",\"content\":\"14 inches\"}, {\"group\":\"Màn hình\",\"title\":\"Tần số quét\",\"content\":\"60 Hz\"}, {\"group\":\"CPU\",\"title\":\"Loại CPU\",\"content\":\"Intel Core i5\"}, {\"group\":\"RAM\",\"title\":\"Dung lượng\",\"content\":\"8 GB\"}]";
// const arrayInput = [{"group":"Màn hình","title":"Kích thước","content":"14 inches"}, {"group":"Màn hình","title":"Tần số quét","content":"60 Hz"}, {"group":"CPU","title":"Loại CPU","content":"Intel Core i5"}, {"group":"RAM","title":"Dung lượng","content":"8 GB"}];
// const invalidString = "not a json string";
// const invalidType = 123;
// const emptyArray = [];
// const nullInput = null;

// console.log("Test với chuỗi JSON:", transformSpecifications(jsonStringInput));
// console.log("Test với Mảng:", transformSpecifications(arrayInput));
// console.log("Test với chuỗi không hợp lệ:", transformSpecifications(invalidString));
// console.log("Test với kiểu không hợp lệ:", transformSpecifications(invalidType));
// console.log("Test với mảng rỗng:", transformSpecifications(emptyArray));
// console.log("Test với null:", transformSpecifications(nullInput));