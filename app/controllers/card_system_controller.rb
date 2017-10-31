class CardSystemController < ApplicationController
  def index
    @studio_user = StudioUser.all
    @page = "index"
  end

  def regist
    @studio_user = StudioUser.all
    @page = "regist"
    render :index
  end

  def change
    @studio_user = StudioUser.all
    @page = "change"
    render :index
  end

  def use
    @studio_user = StudioUser.all
    @page = "use"
    render :index
  end

end
