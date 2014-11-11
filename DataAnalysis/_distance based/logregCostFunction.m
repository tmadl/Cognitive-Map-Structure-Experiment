function [J, grad] = logregCostFunction(theta, X, y)

m = length(y); % number of training eXamples

J = 0;
grad = zeros(size(theta));

J = 1/m*sum(-y'.*log(sigmoid(theta'*X')) - (1-y').*log(1-sigmoid(theta'*X')));

n = length(theta);
for i=1:n
	grad(i) = 1/m*sum((sigmoid(theta'*X') - y')*X(:, i));
end;

end