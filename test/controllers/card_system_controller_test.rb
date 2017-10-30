require 'test_helper'

class CardSystemControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get card_system_index_url
    assert_response :success
  end

end
