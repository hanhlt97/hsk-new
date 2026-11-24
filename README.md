# HSK – chạy local và Docker

## Docker

```sh
docker compose up -d --build
docker compose exec hsk node server/create-admin.js ban@example.com 'MatKhauDaiNgauNhien' 'Admin'
```

Mở http://localhost:3000. Không có tài khoản hay mật khẩu mặc định.
Lệnh tạo admin có thể đặt lại mật khẩu tài khoản đã tồn tại. Mật khẩu truyền qua dòng lệnh có thể lưu trong lịch sử shell; có thể dùng biến ADMIN_PASSWORD thay thế.

```sh
docker compose logs -f --tail=100
docker compose stop
docker compose up -d
```

Dữ liệu nằm trong volume `hsk-data`. Không dùng `docker compose down -v` trừ khi chủ đích xóa toàn bộ dữ liệu.

## Chạy không Docker

Cần Node 24.

```sh
npm ci
npm start
npm run create-admin -- ban@example.com 'MatKhauDaiNgauNhien' 'Admin'
```

SQLite được tạo tự động tại `data/data.db`. Đổi đường dẫn bằng `DB_PATH`.

## VPS và HTTPS

1. Cài Docker Engine và Compose trên VPS, sao chép source lên máy.
2. Trong Compose đổi cổng thành `127.0.0.1:3000:3000` và đặt `TRUST_PROXY: "1"`.
3. Chạy Caddy trực tiếp trên VPS (ngoài Docker), với Caddyfile sau; thay tên miền bằng tên miền thực đã trỏ DNS về VPS:

```caddyfile
hsk.example.com {
    reverse_proxy 127.0.0.1:3000
}
```

4. Mở cổng 80 và 443 cho Caddy; không công khai cổng 3000. Khởi động lại Compose sau khi sửa cấu hình.
5. Kiểm tra đăng nhập qua HTTPS. Không bật tin proxy khi ứng dụng vẫn truy cập trực tiếp từ Internet.

## Sao lưu SQLite an toàn khi đang chạy

Không chỉ sao chép riêng `data.db` khi SQLite đang dùng WAL. Dùng API backup của SQLite để tạo ảnh nhất quán:

```sh
mkdir -p backups
docker compose exec -T hsk node -e "const {DatabaseSync,backup}=require('node:sqlite'); const db=new DatabaseSync('/data/data.db'); backup(db,'/data/backup.db').then(()=>db.close())"
docker compose cp hsk:/data/backup.db ./backups/backup.db
```

Đặt lịch chạy hằng ngày, giữ nhiều phiên bản ngoài VPS và bảo vệ file sao lưu vì chứa dữ liệu người dùng và hash mật khẩu.
Khôi phục nên thực hiện khi ứng dụng dừng, bằng cách thay database trong volume và loại bỏ WAL/SHM cũ sau khi đã sao lưu đầy đủ. Thử phục hồi trên một môi trường riêng trước khi thay dữ liệu đang dùng.

## Các nâng cấp hiện tại

- Luyện nhanh ưu tiên từ có hộp SRS thấp và từ đã sai nhiều.
- Thành tích: bắt đầu, 100 lượt, chuỗi 3/7 ngày, thuộc 10 từ.
- Trang chủ hiển thị các từ yếu; thống kê lưu lịch sử 30 phiên gần nhất.
- PWA cache shell giao diện để mở lại khi offline; API tài khoản vẫn cần server.

## Nạp bộ dữ liệu VIP

Ứng dụng có pipeline nhập dữ liệu có kiểm tra, không nhúng mù một file tải trên mạng:

```sh
node tools/import-vocab.js data/hsk.csv
# hoặc
npm run import:vocab -- data/hsk.tsv
```

CSV/TSV cần các cột:

```text
level,hanzi,pinyin,meaning,example,exampleMeaning,tags
1,你好,nǐ hǎo,"xin chào","你好！","Xin chào!","greeting|core"
```

Pipeline sẽ:

- đọc CSV có dấu ngoặc kép và TSV;
- kiểm tra cấp 1–9;
- kiểm tra trường bắt buộc;
- phát hiện từ trùng trong cùng cấp;
- chuẩn hóa thành `data/vocab.json`;
- giữ câu ví dụ, bản dịch và tag;
- ghi nguồn và thời điểm nhập để không nhầm dữ liệu mẫu với danh sách chính thức.

`public/js/data.js` hiện vẫn là bộ mẫu đang chạy trong trình duyệt. Chỉ thay nó sau khi đã kiểm tra giấy phép, nguồn và cấp HSK của bộ dữ liệu chính thức. Không nên lấy ngẫu nhiên một repo trên mạng rồi gọi là HSK 3.0: HSK 3.0 có nhiều phiên bản công bố và cách phân cấp cần đối chiếu.

## Giới hạn hiện tại

- Chưa có xác nhận email hay quên mật khẩu qua email; admin đặt lại mật khẩu.
- Bộ từ vựng chỉ là mẫu chưa đối chiếu danh sách HSK chính thức.
- Đồng bộ sử dụng ảnh dữ liệu toàn tài khoản, chưa xử lý đầy đủ xung đột khi hai thiết bị cùng sửa hoặc xóa dữ liệu. Tránh học đồng thời trên hai máy.
- PWA chỉ cache giao diện; phiên đăng nhập và API vẫn cần server.