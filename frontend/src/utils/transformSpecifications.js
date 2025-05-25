

/**
 * Chuyển đổi dữ liệu specifications (có thể là chuỗi JSON hoặc mảng)
 * thành cấu trúc có nhóm và tóm tắt.
 * @param {string | Array<object>} inputSpecs - Dữ liệu specs đầu vào, có thể là chuỗi JSON hoặc mảng các object.
 * @returns {object | null} Object chứa { full: Array<{ group: string, items: Array<{ label: string, value: string }> }>, summary: Array<{ label: string, value: string }> } hoặc null nếu input không hợp lệ.
 */
export const transformSpecifications = (inputSpecs) => {
  let flatSpecs;


  if (!inputSpecs) {
    console.warn("Input specifications is null or undefined.");
    return null;
  }


  if (typeof inputSpecs === 'string') {
    try {
      flatSpecs = JSON.parse(inputSpecs);
      console.log("Parsed specifications from JSON string:", flatSpecs);
    } catch (error) {
      console.error("Error parsing specifications JSON string:", error, "Input string:", inputSpecs);
      return null;
    }
  } else if (Array.isArray(inputSpecs)) {

    flatSpecs = inputSpecs;
    console.log("Using specifications directly as array:", flatSpecs);
  } else {

    console.warn("Invalid input type for specifications. Expected string or array, received:", typeof inputSpecs);
    return null;
  }


  if (!Array.isArray(flatSpecs) || flatSpecs.length === 0) {
    console.warn("Transformed specifications is not a valid non-empty array.");
    return null;
  }


  const groupedSpecs = flatSpecs.reduce((acc, currentSpec) => {

    if (typeof currentSpec !== 'object' || currentSpec === null ||
        !currentSpec.group || typeof currentSpec.group !== 'string' ||
        !currentSpec.title || typeof currentSpec.title !== 'string' ||
        currentSpec.content === undefined || currentSpec.content === null) {
      console.warn("Bỏ qua spec không hợp lệ hoặc thiếu trường:", currentSpec);
      return acc;
    }

    const groupName = currentSpec.group.trim();
    const label = currentSpec.title.trim();
    const value = currentSpec.content;


    if (!groupName || !label) {
        console.warn("Bỏ qua spec có group hoặc title rỗng:", currentSpec);
        return acc;
    }


    let group = acc.find(g => g.group === groupName);
    if (!group) {
      group = { group: groupName, items: [] };
      acc.push(group);
    }

    group.items.push({ label: label, value: String(value) });
    return acc;
  }, []);


   if (groupedSpecs.length === 0) {
      console.warn("No valid specifications groups were created.");
      return { full: [], summary: [] };
   }



  const summary = [];


  const importantSpecs = [
    { priority: 1, keywords: ["màn hình", "display", "screen", "kích thước"] },
    { priority: 2, keywords: ["chip", "cpu", "xử lý", "processor", "vi xử lý"] },
    { priority: 3, keywords: ["ram", "memory"] },
    { priority: 4, keywords: ["bộ nhớ", "rom", "storage", "lưu trữ", "dung lượng"] },
    { priority: 5, keywords: ["pin", "battery", "dung lượng pin"] },
    { priority: 6, keywords: ["camera sau", "camera chính", "rear camera"] },
    { priority: 7, keywords: ["camera trước", "camera selfie", "front camera"] },
    { priority: 8, keywords: ["os", "hệ điều hành"] }

  ];


  const containsKeyword = (text, keywords) => {
    if (typeof text !== 'string') return false;
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
  };


  const addedPriorities = new Set();


  groupedSpecs.forEach(group => {
    const groupName = group.group;


    for (const item of group.items) {
       for (const spec of importantSpecs) {

           if (!addedPriorities.has(spec.priority) && containsKeyword(item.label, spec.keywords)) {
                summary.push({
                    label: item.label,
                    value: item.value,
                    priority: spec.priority
                });
                addedPriorities.add(spec.priority);
                break;
           }
       }
    }


     for (const spec of importantSpecs) {

         if (!addedPriorities.has(spec.priority) && containsKeyword(groupName, spec.keywords) && group.items.length > 0) {

              summary.push({
                 label: groupName,
                 value: group.items[0].value,
                 priority: spec.priority
              });
              addedPriorities.add(spec.priority);
              break;
         }
     }
  });


  const sortedSummary = summary
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 6)
    .map(({ label, value }) => ({ label, value }));


  return { full: groupedSpecs, summary: sortedSummary };
};














