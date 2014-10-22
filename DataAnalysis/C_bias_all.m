allreald = [];
allestd = [];
allcorrestd = [];
allworb = [];

files=dir('logs');
for i=3:length(files)
    n = files(i).name
    try
        ldata = loadjson(['logs/' n]);
    catch err
        error = 1;
        err
    end;
    f = fieldnames(ldata);
    exp = f(3);
    %if strfind(exp{1}, 'exp')
        d=ldata.(exp{1});
    %else
    %    d=ldata;
    %end;
    
    B_biasfromjson;
    
    allreald=[allreald reald];
    allestd=[allestd estd];
    allworb=[allworb worb];
    b_estd = estd;
    
    d=ldata.exp1;
    A_distfromjson;
    b_estd = b_estd .* p(1) + p(2);
    allcorrestd = [allcorrestd b_estd];
end;

% allerr=(allestd-allreald);
% [h,p]=ttest(allerr(find(allworb==0)), allerr(find(allworb==1)))
% between_mean_std = [mean(allerr(find(allworb==0))) std(allerr(find(allworb==0)))]
% across_mean_std = [mean(allerr(find(allworb==1))) std(allerr(find(allworb==1)))]
% 
% subplot(2,2,1);
% title('distance errors (uncorrected)')
% scatter(allreald(find(allworb==0)), allestd(find(allworb==0)), 'b')
% hold on;
% scatter(allreald(find(allworb==1)), allestd(find(allworb==1)), 'r')
% legend('within cluster', 'between cluster')
% xlabel('real distance')
% ylabel('estimated distance')
% h = lsline;
% set(h(1),'color','b','LineWidth',2)
% set(h(2),'color','r','LineWidth',2)
% scatter(1:800, 1:800, 1, 'k');
% 
% subplot(2,2,2);
% title('distance errors (uncorrected)')
% scatter(allreald(find(allworb==0)), allerr(find(allworb==0)), 'b')
% hold on;
% scatter(allreald(find(allworb==1)), allerr(find(allworb==1)), 'r')
% legend('within cluster', 'between cluster')
% xlabel('real distance')
% ylabel('distance error')
% h = lsline;
% set(h(1),'color','b','LineWidth',2)
% set(h(2),'color','r','LineWidth',1)

%%%%%%%%%%%%%%%5

allestd = allcorrestd;

allerr=(allestd-allreald);
[h,p]=ttest(allerr(find(allworb==0)), allerr(find(allworb==1)))
between_mean_std = [mean(allerr(find(allworb==0))) std(allerr(find(allworb==0)))]
across_mean_std = [mean(allerr(find(allworb==1))) std(allerr(find(allworb==1)))]

subplot(1,2,1);
title('distance errors (corrected by individual bias)')
scatter(allreald(find(allworb==0)), allestd(find(allworb==0)), 'b')
hold on;
scatter(allreald(find(allworb==1)), allestd(find(allworb==1)), 'r')
legend('within cluster', 'between cluster')
xlabel('real distance')
ylabel('estimated distance')
h = lsline;
set(h(1),'color','b','LineWidth',2)
set(h(2),'color','r','LineWidth',2)
scatter(1:500, 1:500, 1, 'k');

subplot(1,2,2);
title('distance errors (corrected by individual bias)')
scatter(allreald(find(allworb==0)), allerr(find(allworb==0)), 'b')
hold on;
scatter(allreald(find(allworb==1)), allerr(find(allworb==1)), 'r')
legend('within cluster', 'between cluster')
xlabel('real distance')
ylabel('distance error')
h = lsline;
set(h(1),'color','b','LineWidth',2)
set(h(2),'color','r','LineWidth',2)
