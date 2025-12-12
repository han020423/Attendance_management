// controllers/sseController.js
exports.connect = (req, res) => {
  // SSE 기본 헤더 설정
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // 헤더 즉시 전송

  const userId = req.session.user.id;
  const clients = req.app.get('sseClients');
  clients.set(String(userId), res); // userId를 문자열로 변환하여 저장

  // 20초마다 주석을 보내 연결 유지
  const keepAliveInterval = setInterval(() => {
    res.write(': keep-alive\n\n');
  }, 20000);

  // 연결이 끊어졌을 때
  req.on('close', () => {
    clients.delete(String(userId)); // 삭제 시에도 문자열로 변환된 키 사용
    clearInterval(keepAliveInterval);
    res.end();
  });
};

