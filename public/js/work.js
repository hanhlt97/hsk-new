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
  },
  procurement: {
    name: 'Mua hàng & cung ứng', icon: '🛒', desc: 'RFQ, báo giá, nhà cung cấp, đơn hàng và tiến độ giao liệu.',
    words: [['采购','cǎigòu','mua hàng'],['询价','xúnjià','hỏi giá'],['报价','bàojià','báo giá'],['订单','dìngdān','đơn đặt hàng'],['采购单','cǎigòu dān','đơn mua hàng'],['合同','hétóng','hợp đồng'],['交期','jiāoqī','thời hạn giao hàng'],['交货期','jiāohuòqī','kỳ hạn giao hàng'],['供应','gōngyìng','cung ứng'],['价格','jiàgé','giá cả'],['付款','fùkuǎn','thanh toán'],['账期','zhàngqī','kỳ hạn công nợ'],['替代料','tìdàiliào','liệu thay thế'],['缺货','quēhuò','hết hàng'],['催料','cuīliào','thúc liệu'],['交付','jiāofù','bàn giao / giao hàng']],
    phrases: [['请提供报价单。','Qǐng tígōng bàojiàdān.','Vui lòng cung cấp bảng báo giá.'],['供应商确认交期了吗？','Gōngyìngshāng quèrèn jiāoqī le ma?','Nhà cung cấp đã xác nhận thời hạn giao chưa?'],['这批物料需要加急。','Zhè pī wùliào xūyào jiājí.','Lô vật liệu này cần gấp.']]
  },
  planning: {
    name: 'Kế hoạch & điều độ', icon: '📅', desc: 'Kế hoạch sản xuất, năng lực máy, lệnh sản xuất và tiến độ giao hàng.',
    words: [['计划员','jìhuàyuán','nhân viên kế hoạch'],['排产','páichǎn','xếp lịch sản xuất'],['生产计划','shēngchǎn jìhuà','kế hoạch sản xuất'],['工单','gōngdān','lệnh sản xuất'],['需求','xūqiú','nhu cầu'],['产能','chǎnnéng','năng lực sản xuất'],['负荷','fùhè','tải / tải máy'],['交期','jiāoqī','hạn giao hàng'],['紧急订单','jǐnjí dìngdān','đơn hàng gấp'],['延期','yánqī','trì hoãn'],['提前','tíqián','đẩy sớm'],['优先级','yōuxiānjí','mức ưu tiên'],['协调','xiétiáo','điều phối'],['瓶颈','píngjǐng','nút thắt'],['达成率','dáchénglǜ','tỷ lệ hoàn thành'],['预测','yùcè','dự báo']],
    phrases: [['请更新生产计划。','Qǐng gēngxīn shēngchǎn jìhuà.','Vui lòng cập nhật kế hoạch sản xuất.'],['这个订单需要优先安排。','Zhège dìngdān xūyào yōuxiān ānpái.','Đơn hàng này cần được sắp xếp ưu tiên.'],['目前的瓶颈在哪里？','Mùqián de píngjǐng zài nǎlǐ?','Nút thắt hiện tại nằm ở đâu?']]
  },
  maintenance: {
    name: 'Bảo trì máy móc', icon: '🔧', desc: 'Bảo trì định kỳ, sửa chữa, điện, khí nén và xử lý dừng máy.',
    words: [['维修','wéixiū','sửa chữa'],['保养','bǎoyǎng','bảo dưỡng'],['点检','diǎnjiǎn','kiểm tra điểm'],['预防保养','yùfáng bǎoyǎng','bảo dưỡng phòng ngừa'],['故障','gùzhàng','hỏng hóc'],['停机时间','tíngjī shíjiān','thời gian dừng máy'],['电气','diànqì','điện khí'],['气压','qìyā','áp suất khí'],['液压','yèyā','thủy lực'],['温度','wēndù','nhiệt độ'],['压力','yālì','áp lực'],['更换','gēnghuàn','thay thế'],['零件','língjiàn','linh kiện'],['备件','bèijiàn','phụ tùng dự phòng'],['复机','fùjī','khởi động lại máy'],['锁定挂牌','suǒdìng guàpái','khóa và treo thẻ LOTO']],
    phrases: [['机器发生故障了。','Jīqì fāshēng gùzhàng le.','Máy bị sự cố rồi.'],['请先切断电源。','Qǐng xiān qiēduàn diànyuán.','Vui lòng ngắt nguồn điện trước.'],['维修完成后请试机。','Wéixiū wánchéng hòu qǐng shìjī.','Sau khi bảo trì xong hãy chạy thử máy.']]
  },
  it: {
    name: 'IT & hệ thống nhà máy', icon: '💻', desc: 'Tài khoản, mạng, phần mềm, máy quét và hệ thống quản lý sản xuất.',
    words: [['电脑','diànnǎo','máy tính'],['系统','xìtǒng','hệ thống'],['网络','wǎngluò','mạng'],['账号','zhànghào','tài khoản'],['密码','mìmǎ','mật khẩu'],['权限','quánxiàn','quyền truy cập'],['服务器','fúwùqì','máy chủ'],['软件','ruǎnjiàn','phần mềm'],['硬件','yìngjiàn','phần cứng'],['扫描枪','sǎomiáo qiāng','súng quét mã'],['打印机','dǎyìnjī','máy in'],['数据','shùjù','dữ liệu'],['备份','bèifèn','sao lưu'],['故障','gùzhàng','lỗi / sự cố'],['重启','chóngqǐ','khởi động lại'],['更新','gēngxīn','cập nhật']],
    phrases: [['系统无法登录。','Xìtǒng wúfǎ dēnglù.','Không thể đăng nhập hệ thống.'],['请提供错误截图。','Qǐng tígōng cuòwù jiétú.','Vui lòng cung cấp ảnh chụp lỗi.'],['我会尽快处理。','Wǒ huì jǐnkuài chǔlǐ.','Tôi sẽ xử lý sớm nhất có thể.']]
  },
  ehs: {
    name: 'EHS & môi trường', icon: '🌱', desc: 'Môi trường, hóa chất, chất thải, đánh giá rủi ro và tuân thủ.',
    words: [['环境','huánjìng','môi trường'],['化学品','huàxuépǐn','hóa chất'],['废弃物','fèiqìwù','chất thải'],['废水','fèishuǐ','nước thải'],['废气','fèiqì','khí thải'],['噪音','zàoyīn','tiếng ồn'],['风险','fēngxiǎn','rủi ro'],['评估','pínggū','đánh giá'],['隐患','yǐnhuàn','mối nguy tiềm ẩn'],['整改','zhěnggǎi','khắc phục'],['许可证','xǔkězhèng','giấy phép'],['应急演练','yìngjí yǎnliàn','diễn tập khẩn cấp'],['泄漏','xièlòu','rò rỉ'],['污染','wūrǎn','ô nhiễm'],['合规','héguī','tuân thủ']],
    phrases: [['请进行风险评估。','Qǐng jìnxíng fēngxiǎn pínggū.','Vui lòng thực hiện đánh giá rủi ro.'],['化学品必须贴标签。','Huàxuépǐn bìxū tiē biāoqiān.','Hóa chất bắt buộc phải dán nhãn.'],['发现隐患要立即整改。','Fāxiàn yǐnhuàn yào lìjí zhěnggǎi.','Phát hiện mối nguy phải khắc phục ngay.']]
  }
};

const WORK_WORDS = Object.entries(WORK).flatMap(([dept, d]) => d.words.map(([h,p,m]) => ({ id: 'work:' + dept + ':' + h, h, p, m, dept })));
