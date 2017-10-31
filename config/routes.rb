Rails.application.routes.draw do
  devise_for :users
  root 'card_system#index'
  get 'card_system/index'
  #get 'card_system/regist'
  namespace :card_system do
    get 'index'
    get 'regist'
    get 'change'
    get 'use'
  end

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
