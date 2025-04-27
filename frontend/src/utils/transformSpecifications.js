// Ví dụ: src/utils/transformers.js
/**
 * Chuyển đổi mảng specs phẳng thành cấu trúc có nhóm.
 * @param {Array<object>} flatSpecs - Mảng specs dạng [{ group, title, content }, ...]
 * @returns {object|null} Object chứa { full: Array<{ group: string, items: Array<{ label: string, value: string }> }> } hoặc null nếu input không hợp lệ.
 */
export const transformSpecifications = (flatSpecs) => {
    if (!Array.isArray(flatSpecs) || flatSpecs.length === 0) {
      return null;
    }
    const groupedSpecs = flatSpecs.reduce((acc, currentSpec) => {
      if (!currentSpec.group || !currentSpec.title || currentSpec.content === undefined || currentSpec.content === null) {
          console.warn("Bỏ qua spec không hợp lệ:", currentSpec);
          return acc;
      }
      const groupName = currentSpec.group;
      const label = currentSpec.title;
      const value = currentSpec.content;
      let group = acc.find(g => g.group === groupName);
      if (!group) {
        group = { group: groupName, items: [] };
        acc.push(group);
      }
      group.items.push({ label: label, value: String(value) });
      return acc;
    }, []);
    return { full: groupedSpecs, summary: [] }; // Giả sử không cần summary nữa
  };
  
  // --- DỮ LIỆU SPECS MẪU CỦA BẠN (để test hàm) ---
  const rawSpecsData = [
      {"group": "Bộ xử lý", "title": "CPU", "content": "Apple M3 chip (8-core CPU với 4 performance cores và 4 efficiency cores)"},
      {"group": "Bộ xử lý", "title": "GPU", "content": "10-core GPU"},
      {"group": "Bộ xử lý", "title": "Neural Engine", "content": "16-core Neural Engine"},
      {"group": "Bộ xử lý", "title": "Media Engine", "content": "Hardware-accelerated H.264, HEVC, ProRes, và ProRes RAW, video decode và encode engine"},
      {"group": "Bộ nhớ", "title": "RAM", "content": "8GB / 16GB / 24GB unified memory"},
      {"group": "Bộ nhớ", "title": "Ổ cứng", "content": "SSD 256GB / 512GB / 1TB / 2TB"},
      {"group": "Màn hình", "title": "Kích thước", "content": "14.2 inch (diagonal) Liquid Retina XDR display"},
      {"group": "Màn hình", "title": "Độ phân giải", "content": "3024 x 1964 pixels at 254 ppi"},
      {"group": "Màn hình", "title": "Công nghệ", "content": "ProMotion technology (120Hz), True Tone, Wide color (P3), 1000 nits sustained brightness, 1600 nits peak brightness (HDR)"},
      {"group": "Màn hình", "title": "Notch", "content": "Có camera notch ở trên cùng"},
      {"group": "Camera", "title": "FaceTime HD", "content": "1080p FaceTime HD camera"},
      {"group": "Camera", "title": "Tính năng", "content": "Advanced image signal processor với computational video"},
      {"group": "Âm thanh", "title": "Loa", "content": "Hệ thống 6 loa high-fidelity với force-cancelling woofers"},
      {"group": "Âm thanh", "title": "Microphone", "content": "Studio-quality three-mic array với high signal-to-noise ratio và directional beamforming"},
      {"group": "Âm thanh", "title": "Công nghệ", "content": "Hỗ trợ Spatial Audio khi phát nhạc hoặc video với Dolby Atmos"},
      {"group": "Kết nối", "title": "Wi-Fi", "content": "Wi-Fi 6E (802.11ax)"},
      {"group": "Kết nối", "title": "Bluetooth", "content": "Bluetooth 5.3"},
      {"group": "Cổng kết nối", "title": "Thunderbolt", "content": "3 cổng Thunderbolt 4 (hỗ trợ lên đến 40Gb/s)"},
      {"group": "Cổng kết nối", "title": "HDMI", "content": "1 cổng HDMI"},
      {"group": "Cổng kết nối", "title": "SDXC", "content": "SDXC card slot"},
      {"group": "Cổng kết nối", "title": "MagSafe", "content": "Cổng sạc MagSafe 3"},
      {"group": "Cổng kết nối", "title": "Giắc cắm tai nghe", "content": "Giắc cắm tai nghe 3.5mm với hỗ trợ tai nghe advanced"},
      {"group": "Pin", "title": "Thời lượng", "content": "Lên đến 22 giờ xem video Apple TV; lên đến 18 giờ duyệt web không dây"},
      {"group": "Pin", "title": "Sạc", "content": "Sạc 70W USB-C Power Adapter"},
      {"group": "Bàn phím & Touchpad", "title": "Bàn phím", "content": "Magic Keyboard với phím Function đầy đủ và Touch ID"},
      {"group": "Bàn phím & Touchpad", "title": "Touchpad", "content": "Force Touch trackpad"},
      {"group": "Kích thước & Trọng lượng", "title": "Kích thước", "content": "31.26 x 22.12 x 1.55 cm (W x D x H)"},
      {"group": "Kích thước & Trọng lượng", "title": "Trọng lượng", "content": "1.55 kg"},
      {"group": "Hệ điều hành", "title": "OS", "content": "macOS Sonoma (có thể cập nhật lên phiên bản mới hơn)"}
  ];
  
  // // Test hàm chuyển đổi
  // const transformedSpecs = transformSpecifications(rawSpecsData);
  // console.log("Transformed Specs:", JSON.stringify(transformedSpecs, null, 2));