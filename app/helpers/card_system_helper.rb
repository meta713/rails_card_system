module CardSystemHelper
  def current_page_title(page)
    case page
    when "index" then
      "ホーム"
    when "regist" then
      "登録"
    when "change" then
      "更新"
    when "use" then
      "工房利用"
    else
      "unknown"
    end
  end
end
