// Tiếng Trung đi làm trong văn phòng, kỹ thuật và khu công nghiệp.
const WORK = {
  office: {
    name: 'Văn phòng & hành chính', icon: '🗂️', desc: 'Email, cuộc họp, giấy tờ, nhân sự và giao tiếp công sở.',
    words: [
      ['办公室','bàngōngshì','văn phòng'],['会议','huìyì','cuộc họp'],['会议室','huìyìshì','phòng họp'],['日程','rìchéng','lịch trình'],['文件','wénjiàn','tài liệu'],['报告','bàogào','báo cáo'],['申请','shēnqǐng','đơn / xin phép'],['批准','pīzhǔn','phê duyệt'],['签字','qiānzì','ký tên'],['盖章','gàizhāng','đóng dấu'],['通知','tōngzhī','thông báo'],['客户','kèhù','khách hàng'],['供应商','gōngyìngshāng','nhà cung cấp'],['人事','rénshì','nhân sự'],['加班','jiābān','tăng ca'],['请假','qǐngjià','xin nghỉ phép']
    ], phrases: [['请查收附件。','Qǐng cháshōu fùjiàn.','Vui lòng kiểm tra file đính kèm.'],['会议改到下午三点。','Huìyì gǎi dào xiàwǔ sān diǎn.','Cuộc họp chuyển sang 3 giờ chiều.'],['请确认交期。','Qǐng quèrèn jiāoqī.','Vui lòng xác nhận thời hạn giao hàng.']]
  },
  engineering: {
    name: 'Kỹ sư & kỹ thuật', icon: '⚙️', desc: 'Bản vẽ, thông số, thử nghiệm, cải tiến và xử lý sự cố.',
    words: [
      ['工程师','gōngchéngshī','kỹ sư'],['技术员','jìshùyuán','kỹ thuật viên'],['图纸','túzhǐ','bản vẽ'],['规格','guīgé','quy cách'],['参数','cānshù','thông số'],['尺寸','chǐcùn','kích thước'],['公差','gōngchā','dung sai'],['材料','cáiliào','vật liệu'],['设备','shèbèi','thiết bị'],['治具','zhìjù','đồ gá'],['模具','mújù','khuôn'],['测试','cèshì','kiểm tra / test'],['样品','yàngpǐn','mẫu'],['验证','yànzhèng','xác nhận / validation'],['改善','gǎishàn','cải tiến'],['异常','yìcháng','bất thường'],['原因','yuányīn','nguyên nhân'],['对策','duìcè','đối sách'],['维修','wéixiū','bảo trì / sửa chữa']
    ], phrases: [['请按照图纸作业。','Qǐng ànzhào túzhǐ zuòyè.','Vui lòng làm theo bản vẽ.'],['这个参数需要确认。','Zhège cānshù xūyào quèrèn.','Thông số này cần xác nhận.'],['请分析异常原因。','Qǐng fēnxī yìcháng yuányīn.','Vui lòng phân tích nguyên nhân bất thường.']]
  },
  production: {
    name: 'Sản xuất & hiện trường', icon: '🏭', desc: 'Công đoạn, chuyền, năng suất, kế hoạch và điều phối ca.',
    words: [
      ['生产','shēngchǎn','sản xuất'],['工厂','gōngchǎng','nhà máy'],['车间','chējiān','xưởng'],['产线','chǎnxiàn','dây chuyền'],['工位','gōngwèi','vị trí công việc'],['工序','gōngxù','công đoạn'],['员工','yuángōng','nhân viên'],['班组','bānzǔ','tổ / nhóm ca'],['早班','zǎobān','ca sáng'],['夜班','yèbān','ca đêm'],['产量','chǎnliàng','sản lượng'],['效率','xiàolǜ','hiệu suất'],['计划','jìhuà','kế hoạch'],['进度','jìndù','tiến độ'],['停机','tíngjī','dừng máy'],['缺料','quēliào','thiếu liệu'],['换线','huànxiàn','đổi chuyền'],['标准作业','biāozhǔn zuòyè','thao tác tiêu chuẩn'],['日报','rìbào','báo cáo ngày']
    ], phrases: [['今天的产量是多少？','Jīntiān de chǎnliàng shì duōshǎo?','Sản lượng hôm nay là bao nhiêu?'],['这条产线暂时停机。','Zhè tiáo chǎnxiàn zànshí tíngjī.','Dây chuyền này tạm dừng máy.'],['请确认生产进度。','Qǐng quèrèn shēngchǎn jìndù.','Vui lòng xác nhận tiến độ sản xuất.']]
  },
  quality: {
    name: 'Chất lượng QC/QA', icon: '🔍', desc: 'Lỗi, tiêu chuẩn, kiểm tra đầu vào, công đoạn và xuất hàng.',
    words: [
      ['质量','zhìliàng','chất lượng'],['检验','jiǎnyàn','kiểm nghiệm'],['检查','jiǎnchá','kiểm tra'],['合格','hégé','đạt'],['不合格','bù hégé','không đạt'],['缺陷','quēxiàn','khuyết tật'],['不良品','bùliángpǐn','hàng lỗi'],['良率','liánglǜ','tỷ lệ đạt'],['标准','biāozhǔn','tiêu chuẩn'],['要求','yāoqiú','yêu cầu'],['抽检','chōujiǎn','kiểm tra lấy mẫu'],['全检','quánjiǎn','kiểm tra 100%'],['返工','fǎngōng','làm lại'],['返修','fǎnxiū','sửa lại'],['客诉','kèsù','khiếu nại khách hàng'],['报告书','bàogàoshū','phiếu báo cáo']
    ], phrases: [['这个产品不合格。','Zhège chǎnpǐn bù hégé.','Sản phẩm này không đạt.'],['请隔离不良品。','Qǐng gélí bùliángpǐn.','Vui lòng cách ly hàng lỗi.'],['需要做原因分析。','Xūyào zuò yuányīn fēnxī.','Cần thực hiện phân tích nguyên nhân.']]
  },
  warehouse: {
    name: 'Kho vận & logistics', icon: '📦', desc: 'Nhập xuất tồn, mã hàng, đóng gói, giao nhận và vận chuyển.',
    words: [
      ['仓库','cāngkù','kho'],['入库','rùkù','nhập kho'],['出库','chūkù','xuất kho'],['库存','kùcún','tồn kho'],['盘点','pándiǎn','kiểm kê'],['物料','wùliào','vật liệu'],['原材料','yuáncáiliào','nguyên vật liệu'],['成品','chéngpǐn','thành phẩm'],['半成品','bànchéngpǐn','bán thành phẩm'],['批次','pīcì','lô hàng'],['数量','shùliàng','số lượng'],['条码','tiáomǎ','mã vạch'],['包装','bāozhuāng','đóng gói'],['发货','fāhuò','gửi hàng'],['交货','jiāohuò','giao hàng'],['运输','yùnshū','vận chuyển']
    ], phrases: [['请确认物料数量。','Qǐng quèrèn wùliào shùliàng.','Vui lòng xác nhận số lượng vật liệu.'],['这批货什么时候发？','Zhè pī huò shénme shíhou fā?','Lô hàng này khi nào gửi?'],['库存不足，需要补料。','Kùcún bùzú, xūyào bǔliào.','Tồn kho không đủ, cần cấp thêm liệu.']]
  },
  safety: {
    name: 'An toàn lao động', icon: '🦺', desc: 'PPE, cảnh báo nguy hiểm, ứng phó sự cố và quy định hiện trường.',
    words: [
      ['安全','ānquán','an toàn'],['危险','wēixiǎn','nguy hiểm'],['注意','zhùyì','chú ý'],['小心','xiǎoxīn','cẩn thận'],['禁止','jìnzhǐ','cấm'],['必须','bìxū','bắt buộc phải'],['防护','fánghù','bảo hộ'],['安全帽','ānquánmào','mũ bảo hộ'],['手套','shǒutào','găng tay'],['护目镜','hùmùjìng','kính bảo hộ'],['消防','xiāofáng','phòng cháy chữa cháy'],['火灾','huǒzāi','hỏa hoạn'],['事故','shìgù','tai nạn / sự cố'],['应急','yìngjí','khẩn cấp'],['疏散','shūsàn','sơ tán'],['培训','péixùn','đào tạo']
    ], phrases: [['进入现场必须戴安全帽。','Jìnrù xiànchǎng bìxū dài ānquánmào.','Vào hiện trường bắt buộc đội mũ bảo hộ.'],['这里很危险，请马上离开。','Zhèlǐ hěn wēixiǎn, qǐng mǎshàng líkāi.','Ở đây rất nguy hiểm, hãy rời đi ngay.'],['发生事故请立即报告。','Fāshēng shìgù qǐng lìjí bàogào.','Nếu xảy ra sự cố hãy báo cáo ngay.']]
  }
};

const WORK_WORDS = Object.entries(WORK).flatMap(([dept, d]) => d.words.map(([h,p,m]) => ({ id: 'work:' + dept + ':' + h, h, p, m, dept })));
